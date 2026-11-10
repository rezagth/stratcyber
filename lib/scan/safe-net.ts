import http from 'http';
import https from 'https';
import tls from 'tls';
import type { ResolvedAddress } from './net-guard';

/**
 * Sondes réseau des contrôles de campagne. Ce module est le SEUL à ouvrir des connexions vers un client :
 *  - ports figés (80 et 443), chemins figés par l'appelant, aucune valeur libre ne vient de l'utilisateur ;
 *  - connexion à l'adresse déjà validée par net-guard (le nom n'est jamais re-résolu) ;
 *  - aucune redirection suivie, durée et taille de réponse bornées, aucun cookie ni identifiant envoyé ;
 *  - User-Agent explicite, pour que le client reconnaisse le trafic dans ses journaux.
 */

export const SCAN_USER_AGENT = 'StratCyber-ControleExterne/1.0 (audit autorisé par le client ; contact@infracyb.fr)';
const TIMEOUT_MS = 6000;
const MAX_BODY_BYTES = 4096;

export type HttpProbe = { status: number; headers: Record<string, string | string[] | undefined>; body: string };
export type HttpProbeOptions = { host: string; address: ResolvedAddress; port: 80 | 443; path: string };

export type CertInfo = {
  authorized: boolean;
  authorizationError: string | null;
  hostnameMismatch: boolean;
  protocol: string | null;
  validFrom: Date | null;
  validTo: Date | null;
  issuer: string | null;
};

function pinnedLookup(address: ResolvedAddress) {
  // Node peut demander une liste (all: true) ou une seule adresse selon la version : on gère les deux.
  return (_host: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) => {
    if (options?.all) callback(null, [{ address: address.address, family: address.family }]);
    else callback(null, address.address, address.family);
  };
}

export function httpProbe({ host, address, port, path }: HttpProbeOptions): Promise<HttpProbe> {
  return new Promise((resolve, reject) => {
    const transport = port === 443 ? https : http;
    const request = transport.request(
      {
        host,
        port,
        path,
        method: 'GET',
        // Un serveur au certificat invalide reste lisible : on ne lui envoie rien de confidentiel, et le
        // certificat est jugé à part par tlsProbe.
        ...(port === 443 ? { servername: host, rejectUnauthorized: false } : {}),
        headers: { Host: host, 'User-Agent': SCAN_USER_AGENT, Accept: '*/*', Connection: 'close' },
        lookup: pinnedLookup(address) as never,
      },
      (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        const finish = () => resolve({ status: response.statusCode ?? 0, headers: response.headers, body: Buffer.concat(chunks).toString('utf8') });
        response.on('data', (chunk: Buffer) => {
          size += chunk.length;
          chunks.push(chunk);
          if (size >= MAX_BODY_BYTES) { response.destroy(); finish(); }
        });
        response.on('end', finish);
        response.on('error', finish);
        response.on('close', finish); // filet de sécurité : une réponse coupée ne doit jamais laisser la promesse en suspens
      }
    );
    const timer = setTimeout(() => request.destroy(new Error('timeout')), TIMEOUT_MS);
    request.on('error', (error) => { clearTimeout(timer); reject(error); });
    request.on('close', () => clearTimeout(timer));
    request.end();
  });
}

export function tlsProbe(host: string, address: ResolvedAddress): Promise<CertInfo> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: address.address, port: 443, servername: host, rejectUnauthorized: false, timeout: TIMEOUT_MS });
    socket.once('secureConnect', () => {
      const cert = socket.getPeerCertificate();
      const mismatch = cert && Object.keys(cert).length > 0 ? tls.checkServerIdentity(host, cert) !== undefined : true;
      const issuer = cert?.issuer ? [cert.issuer.O, cert.issuer.CN].filter(Boolean).join(' — ') : null;
      const info: CertInfo = {
        authorized: socket.authorized,
        authorizationError: socket.authorized ? null : String(socket.authorizationError ?? 'inconnue'),
        hostnameMismatch: mismatch,
        protocol: socket.getProtocol(),
        validFrom: cert?.valid_from ? new Date(cert.valid_from) : null,
        validTo: cert?.valid_to ? new Date(cert.valid_to) : null,
        issuer,
      };
      socket.end();
      resolve(info);
    });
    socket.once('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
    socket.once('error', (error) => { socket.destroy(); reject(error); });
  });
}

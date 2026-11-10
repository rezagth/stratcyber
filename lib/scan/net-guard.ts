import { isIP } from 'net';
import { promises as dns } from 'dns';

/**
 * Garde-fou réseau des contrôles de campagne (anti-SSRF).
 *
 * Les contrôles de campagne se connectent aux serveurs du client depuis le serveur StratCyber.
 * Sans garde-fou, un nom de domaine qui pointe vers une adresse interne (127.0.0.1, 10.x, 169.254.169.254 =
 * métadonnées du cloud...) ferait lire des ressources internes au nom du serveur. Règles appliquées :
 *  - on résout le nom UNE fois, on refuse s'il donne UNE SEULE adresse non publique ;
 *  - l'appelant se connecte ensuite à l'adresse validée (pas au nom), ce qui empêche le « DNS rebinding ».
 */

export type ResolvedAddress = { address: string; family: 4 | 6 };
export type LookupAll = (host: string) => Promise<Array<{ address: string; family: number }>>;

const defaultLookup: LookupAll = (host) => dns.lookup(host, { all: true, verbatim: true });

function parseIPv4(address: string): number[] | null {
  const parts = address.split('.');
  if (parts.length !== 4) return null;
  const bytes = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return bytes.every((b) => b >= 0 && b <= 255) ? bytes : null;
}

/** Convertit une adresse IPv6 en 16 octets (gère « :: » et un IPv4 final). */
function parseIPv6(input: string): number[] | null {
  let address = input.split('%')[0].toLowerCase();
  if (!address.includes(':')) return null;
  let tail: number[] = [];
  const lastColon = address.lastIndexOf(':');
  const last = address.slice(lastColon + 1);
  if (last.includes('.')) {
    const v4 = parseIPv4(last);
    if (!v4) return null;
    tail = v4;
    address = `${address.slice(0, lastColon + 1)}0:0`;
  }
  const halves = address.split('::');
  if (halves.length > 2) return null;
  const toGroups = (s: string) => (s === '' ? [] : s.split(':'));
  const head = toGroups(halves[0]);
  const rest = halves.length === 2 ? toGroups(halves[1]) : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const groups = halves.length === 2 ? [...head, ...Array(missing).fill('0'), ...rest] : head;
  if (groups.length !== 8) return null;
  const bytes: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    const n = parseInt(g, 16);
    bytes.push(n >> 8, n & 0xff);
  }
  if (tail.length === 4) bytes.splice(12, 4, ...tail);
  return bytes;
}

function forbiddenIPv4([a, b, c]: number[]): boolean {
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // partage d'adresses opérateur (CGNAT)
  if (a === 169 && b === 254) return true; // lien local, dont les métadonnées cloud 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224) return true; // multicast, réservé, broadcast
  return false;
}

/** true si l'adresse ne doit JAMAIS être contactée (privée, locale, réservée, ou illisible). */
export function isForbiddenAddress(address: string): boolean {
  const kind = isIP(address.split('%')[0]);
  if (kind === 4) {
    const v4 = parseIPv4(address);
    return !v4 || forbiddenIPv4(v4);
  }
  if (kind === 6) {
    const v6 = parseIPv6(address);
    if (!v6) return true;
    if (v6.every((b) => b === 0)) return true; // ::
    if (v6.slice(0, 15).every((b) => b === 0) && v6[15] === 1) return true; // ::1
    if ((v6[0] & 0xfe) === 0xfc) return true; // fc00::/7
    if (v6[0] === 0xfe && (v6[1] & 0xc0) === 0x80) return true; // fe80::/10
    if (v6[0] === 0xfe && (v6[1] & 0xc0) === 0xc0) return true; // fec0::/10
    if (v6[0] === 0xff) return true; // multicast
    if (v6[0] === 0x20 && v6[1] === 0x01 && v6[2] === 0x0d && v6[3] === 0xb8) return true; // documentation
    if (v6[0] === 0x20 && v6[1] === 0x02) return true; // 6to4 : embarque un IPv4 arbitraire
    if (v6[0] === 0x00 && v6[1] === 0x64 && v6[2] === 0xff && v6[3] === 0x9b) return true; // NAT64
    if (v6.slice(0, 10).every((b) => b === 0) && v6[10] === 0xff && v6[11] === 0xff) return forbiddenIPv4(v6.slice(12)); // IPv4 mappé
    if (v6.slice(0, 12).every((b) => b === 0)) return true; // IPv4 compatible (obsolète)
    return false;
  }
  return true; // pas une adresse IP : refusé
}

/** Résout `host` et ne renvoie que des adresses publiques ; erreur si une seule adresse est interdite. */
export async function resolvePublicAddresses(
  host: string,
  lookup: LookupAll = defaultLookup
): Promise<{ addresses: ResolvedAddress[] } | { error: string }> {
  let found: Array<{ address: string; family: number }>;
  try {
    found = await lookup(host);
  } catch {
    return { error: `Le nom ${host} ne se résout pas (DNS). Vérifie l'orthographe ou que le domaine est actif.` };
  }
  if (found.length === 0) return { error: `Le nom ${host} ne se résout vers aucune adresse.` };
  if (found.some((f) => isForbiddenAddress(f.address))) {
    return { error: `${host} pointe vers une adresse non publique : contrôle refusé par sécurité.` };
  }
  const addresses = found.map((f) => ({ address: f.address, family: (isIP(f.address) === 6 ? 6 : 4) as 4 | 6 }));
  addresses.sort((a, b) => a.family - b.family); // IPv4 d'abord : plus souvent joignable
  return { addresses };
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Status = { enabled: boolean; recoveryCodesRemaining: number; encryptionConfigured: boolean };
type Setup = { secret: string; otpauthUri: string };

async function postMfa(body: Record<string, string>) {
  const response = await fetch('/api/account/mfa', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Opération impossible.');
  return data;
}

/** Sécurité du compte : double authentification par application (TOTP) et codes de secours. */
export default function AccountSecurityPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch('/api/account/mfa');
    if (response.ok) setStatus(await response.json());
    else setError('Chargement impossible.');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const startSetup = () => run(async () => setSetup(await postMfa({ action: 'setup' })));
  const enable = () =>
    run(async () => {
      const data = await postMfa({ action: 'enable', code });
      setRecoveryCodes(data.recoveryCodes);
      setSetup(null);
      setCode('');
      await load();
    });
  const regenerate = () =>
    run(async () => {
      const data = await postMfa({ action: 'regenerate-codes', code });
      setRecoveryCodes(data.recoveryCodes);
      setCode('');
      await load();
    });
  const disable = () =>
    run(async () => {
      await postMfa({ action: 'disable', code, password });
      setCode('');
      setPassword('');
      setRecoveryCodes(null);
      await load();
    });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sécurité du compte</h1>
        <p className="text-muted-foreground">
          La double authentification protège les données de tous les clients si votre mot de passe fuite.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Double authentification
            {status && (
              <Badge variant={status.enabled ? 'default' : 'destructive'}>
                {status.enabled ? 'Activée' : 'Désactivée'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Code à 6 chiffres d&apos;une application d&apos;authentification (Microsoft Authenticator, Google
            Authenticator, Bitwarden, 1Password…), demandé à chaque connexion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status && <p className="text-sm text-muted-foreground">Chargement…</p>}

          {status && !status.encryptionConfigured && (
            <p className="text-sm text-amber-700">
              Indisponible : la clé MFA_ENCRYPTION_KEY n&apos;est pas configurée sur le serveur.
            </p>
          )}

          {status && status.encryptionConfigured && !status.enabled && !setup && (
            <Button onClick={startSetup} disabled={busy}>
              Activer la double authentification
            </Button>
          )}

          {setup && (
            <div className="space-y-3">
              <p className="text-sm">
                1. Dans votre application, ajoutez un compte avec la clé ci-dessous (saisie manuelle, type « basé sur
                le temps »), ou ouvrez le lien depuis votre téléphone.
              </p>
              <code className="block break-all rounded bg-muted p-3 text-sm font-mono">{setup.secret}</code>
              <a className="text-sm text-blue-600 underline break-all" href={setup.otpauthUri}>
                Ouvrir dans l&apos;application d&apos;authentification
              </a>
              <p className="text-sm">2. Saisissez le code à 6 chiffres affiché par l&apos;application.</p>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="max-w-[10rem]"
                />
                <Button onClick={enable} disabled={busy || code.length < 6}>
                  Vérifier et activer
                </Button>
              </div>
            </div>
          )}

          {recoveryCodes && (
            <div className="space-y-2 rounded border border-amber-400 bg-amber-50 p-4">
              <p className="text-sm font-semibold">
                Codes de secours : notez-les maintenant, ils ne seront plus affichés.
              </p>
              <p className="text-sm">Chaque code remplace une seule fois le code de l&apos;application (téléphone perdu).</p>
              <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
                {recoveryCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {status?.enabled && (
            <div className="space-y-4">
              <p className="text-sm">
                Codes de secours restants : <strong>{status.recoveryCodesRemaining}</strong>
              </p>
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Code actuel de l&apos;application</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="max-w-[10rem]"
                />
              </div>
              <Button variant="outline" onClick={regenerate} disabled={busy || code.length < 6}>
                Générer de nouveaux codes de secours
              </Button>
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="mfa-password">Mot de passe (pour désactiver)</Label>
                <Input
                  id="mfa-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="max-w-xs"
                />
                <Button variant="destructive" onClick={disable} disabled={busy || code.length < 6 || !password}>
                  Désactiver la double authentification
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

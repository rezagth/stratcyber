import type { EmailProvider } from '@/lib/email/provider';
import { SimulationProvider } from '@/lib/email/simulation-provider';
import { ResendProvider } from '@/lib/email/resend-provider';

let override: EmailProvider | null = null;
let simulation: SimulationProvider | null = null;

/** Réservé aux tests : impose un fournisseur ; null revient au comportement normal. */
export function setEmailProviderForTests(provider: EmailProvider | null) {
  override = provider;
}

/**
 * Choisit le fournisseur. Par défaut (EMAIL_MODE absent ou 'simulation') : simulation, rien ne part.
 * EMAIL_MODE=live exige un fournisseur complet (Resend) ; sinon il échoue explicitement plutôt que
 * de retomber silencieusement en simulation (ou, pire, d'envoyer).
 */
export function getEmailProvider(): EmailProvider {
  if (override) return override;
  const mode = (process.env.EMAIL_MODE ?? 'simulation').trim().toLowerCase();
  if (mode === 'simulation') return (simulation ??= new SimulationProvider());
  if (mode === 'live') {
    const provider = (process.env.EMAIL_PROVIDER ?? '').trim().toLowerCase();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (provider === 'resend' && apiKey && from) return new ResendProvider(apiKey, from);
    throw new Error("EMAIL_MODE=live : fournisseur d'envoi incomplet (EMAIL_PROVIDER=resend, RESEND_API_KEY et EMAIL_FROM requis).");
  }
  throw new Error(`EMAIL_MODE=${mode} : mode inconnu ('simulation' ou 'live' attendus).`);
}

import type { EmailProvider } from '@/lib/email/provider';
import { SimulationProvider } from '@/lib/email/simulation-provider';

let override: EmailProvider | null = null;
let simulation: SimulationProvider | null = null;

/** Réservé aux tests : impose un fournisseur ; null revient au comportement normal. */
export function setEmailProviderForTests(provider: EmailProvider | null) {
  override = provider;
}

/**
 * Choisit le fournisseur. Par défaut (EMAIL_MODE absent ou 'simulation') : simulation, rien ne part.
 * Aucun fournisseur réel n'est branché pour l'instant : EMAIL_MODE=live échoue explicitement plutôt
 * que de retomber silencieusement en simulation (ou, pire, d'envoyer).
 */
export function getEmailProvider(): EmailProvider {
  if (override) return override;
  const mode = (process.env.EMAIL_MODE ?? 'simulation').trim().toLowerCase();
  if (mode === 'simulation') return (simulation ??= new SimulationProvider());
  throw new Error(`EMAIL_MODE=${mode} : aucun fournisseur d'envoi réel n'est configuré (seul 'simulation' existe).`);
}

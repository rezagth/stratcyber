/**
 * Identité légale du prestataire (InfraCyb), lue dans l'environnement : rien n'est codé en dur.
 * Une valeur absente apparaît dans le contrat comme un champ « [à compléter] » à remplir avant envoi.
 */
export type ProviderIdentity = {
  legalName: string | null;
  representative: string | null;
  siret: string | null;
  address: string | null;
  email: string | null;
  insurer: string | null;
};

const clean = (v: string | undefined) => (v && v.trim() ? v.trim().slice(0, 300) : null);

export function getProviderIdentity(env: NodeJS.ProcessEnv = process.env): ProviderIdentity {
  return {
    legalName: clean(env.INFRACYB_LEGAL_NAME),
    representative: clean(env.INFRACYB_REPRESENTATIVE),
    siret: clean(env.INFRACYB_SIRET),
    address: clean(env.INFRACYB_ADDRESS),
    email: clean(env.INFRACYB_CONTACT_EMAIL),
    insurer: clean(env.INFRACYB_INSURER),
  };
}

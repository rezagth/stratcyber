/**
 * Questions posées par l'assistant de dossier de conformité. Chaque variable `{{nom}}` utilisée par
 * un modèle de lib/policy/library-documents.ts doit être décrite ici (vérifié par un test).
 * Aucun montant ni seuil réglementaire dans ce fichier : uniquement des libellés et des aides.
 */
export type VariableDef = { label: string; help?: string; placeholder?: string; long?: boolean };

export const VARIABLES: Record<string, VariableDef> = {
  entreprise: { label: "Nom de l'entreprise cliente", placeholder: 'Ex. Cabinet Dupont SAS' },
  adresse: { label: 'Adresse du siège', placeholder: '12 rue de la Paix, 75002 Paris' },
  dirigeant: { label: 'Dirigeant (représentant légal)', help: 'Nom et fonction.', placeholder: 'Marie Dupont, gérante' },
  referent_securite: { label: 'Référent sécurité interne', help: 'La personne qui suit la sécurité au quotidien chez le client.', placeholder: 'Paul Martin, responsable administratif' },
  rssi: { label: 'RSSI ou prestataire cybersécurité', placeholder: 'InfraCyb' },
  contact_securite: { label: 'Adresse e-mail de contact sécurité', help: 'Où signaler un incident ou un message suspect.', placeholder: 'securite@entreprise.fr' },
  telephone_urgence: { label: "Numéro d'urgence (incident)", help: 'Joignable en priorité pendant un incident.', placeholder: '06 00 00 00 00' },
  prestataire_it: { label: 'Prestataire informatique', help: "Société qui gère le parc informatique, s'il y en a une.", placeholder: 'Ex. Société X, ou « aucun »' },
  date_effet: { label: "Date d'entrée en vigueur", placeholder: 'JJ/MM/AAAA' },
  ville: { label: 'Ville de signature', placeholder: 'Paris' },
  frequence_sauvegarde: { label: 'Fréquence des sauvegardes', placeholder: 'quotidienne' },
  duree_conservation_sauvegardes: { label: 'Durée de conservation des sauvegardes', placeholder: '30 jours' },
  lieu_sauvegardes: { label: 'Où sont stockées les sauvegardes', help: 'Copie hors site ou hors ligne comprise.', placeholder: 'Disque externe déconnecté et cloud hébergé en France' },
  systemes_critiques: { label: 'Systèmes et données à sauvegarder en priorité', long: true, placeholder: 'Serveur de fichiers, messagerie, logiciel de gestion' },
  activites_critiques: { label: "Activités à reprendre en priorité après un sinistre", long: true, placeholder: 'Facturation, prise de commandes, support clients' },
  delai_reprise: { label: 'Délai de reprise visé (arrêt maximal acceptable)', placeholder: '24 heures' },
  perte_maximale: { label: 'Perte de données maximale acceptable', placeholder: '24 heures' },
  contact_donnees: { label: 'Contact pour la protection des données', help: 'Délégué à la protection des données (DPO) ou personne référente.', placeholder: 'donnees@entreprise.fr' },
  site_web: { label: 'Site web concerné', placeholder: 'www.entreprise.fr' },
  finalites: { label: 'Pourquoi vous collectez des données personnelles', long: true, help: 'Une finalité par ligne : gestion des clients, paie, recrutement...', placeholder: 'Gestion de la relation client\nGestion de la paie' },
  hebergeur_donnees: { label: 'Hébergeur des données', placeholder: 'Ex. OVHcloud (France)' },
  duree_conservation_donnees: { label: 'Durées de conservation des données', long: true, placeholder: 'Clients : durée du contrat + 3 ans\nCandidats : 2 ans' },
  sous_traitant_nom: { label: 'Nom du sous-traitant (le prestataire)', help: "Dénomination légale, forme juridique et numéro SIRET.", placeholder: 'InfraCyb, EI, SIRET ...' },
  sous_traitant_adresse: { label: 'Adresse du sous-traitant', placeholder: 'Adresse du prestataire' },
  objet_prestation: { label: 'Objet de la prestation', long: true, placeholder: 'Services de RSSI externalisé : audit, accompagnement conformité, suivi de la sécurité' },
  duree_prestation: { label: 'Durée du traitement', placeholder: 'Durée du contrat de prestation' },
  types_donnees: { label: 'Types de données personnelles traitées', long: true, placeholder: "Identité, coordonnées professionnelles, journaux de connexion" },
  categories_personnes: { label: 'Catégories de personnes concernées', long: true, placeholder: 'Salariés, clients, prospects' },
  sous_traitants_ulterieurs: { label: 'Sous-traitants ultérieurs autorisés', long: true, help: 'Laisser « aucun » si le prestataire ne fait appel à personne d\'autre.', placeholder: 'aucun' },
};

export const MAX_SHORT = 300;
export const MAX_LONG = 2000;

/** Valeurs proposées d'avance à partir du dossier client (toujours modifiables). */
export function prefillValues(org: { name?: string | null }, todayIso: string): Record<string, string> {
  const [y, m, d] = todayIso.split('-');
  const values: Record<string, string> = { date_effet: `${d}/${m}/${y}`, rssi: 'InfraCyb' };
  if (org.name) values.entreprise = org.name;
  return values;
}

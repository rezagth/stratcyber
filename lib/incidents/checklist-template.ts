/**
 * Modèle de checklist de réponse à incident (pas de logique réglementaire à interpréter ici :
 * ce sont des aides-mémoire). Les éléments `personalData` ne sont ajoutés que si des données
 * personnelles sont concernées. Les clés (`key`) sont stables : elles identifient l'élément en base.
 */
export type ChecklistTemplateItem = { key: string; phase: string; label: string; personalData?: boolean };

export const CHECKLIST_PHASES = [
  'Qualification',
  'Confinement',
  'Éradication et reprise',
  'Notifications',
  "Retour d'expérience",
] as const;

export const CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  { key: 'qual-timeline', phase: 'Qualification', label: "Noter l'heure de détection et la source de l'alerte" },
  { key: 'qual-scope', phase: 'Qualification', label: 'Identifier les systèmes, comptes et données touchés' },
  { key: 'qual-severity', phase: 'Qualification', label: 'Qualifier la gravité et décider du niveau de mobilisation' },
  { key: 'qual-team', phase: 'Qualification', label: 'Constituer la cellule de crise et désigner un responsable' },
  { key: 'qual-evidence', phase: 'Qualification', label: 'Préserver les preuves (journaux, copies, captures) avant toute action' },

  { key: 'cont-isolate', phase: 'Confinement', label: 'Isoler les systèmes ou comptes compromis' },
  { key: 'cont-creds', phase: 'Confinement', label: 'Réinitialiser les identifiants et révoquer les sessions concernés' },
  { key: 'cont-block', phase: 'Confinement', label: 'Bloquer les indicateurs connus (adresses, domaines, fichiers)' },
  { key: 'cont-backup', phase: 'Confinement', label: "Vérifier que les sauvegardes sont intactes et hors d'atteinte" },

  { key: 'erad-root', phase: 'Éradication et reprise', label: 'Identifier la cause (vecteur d’entrée) et la corriger' },
  { key: 'erad-clean', phase: 'Éradication et reprise', label: 'Supprimer les accès et logiciels malveillants persistants' },
  { key: 'erad-restore', phase: 'Éradication et reprise', label: 'Restaurer les services depuis des sources saines' },
  { key: 'erad-monitor', phase: 'Éradication et reprise', label: 'Renforcer la surveillance après la reprise' },

  { key: 'notif-management', phase: 'Notifications', label: 'Informer la direction du client' },
  { key: 'notif-nis2-early', phase: 'Notifications', label: "Alerte précoce à l'autorité (NIS2) si l'entité est concernée" },
  { key: 'notif-nis2-notif', phase: 'Notifications', label: "Notification de l'incident à l'autorité (NIS2) si l'entité est concernée" },
  { key: 'notif-cnil', phase: 'Notifications', label: 'Notifier la CNIL (violation de données personnelles)', personalData: true },
  { key: 'notif-people', phase: 'Notifications', label: 'Évaluer l’information des personnes concernées', personalData: true },
  { key: 'notif-insurer', phase: 'Notifications', label: "Prévenir l'assureur cyber et, si besoin, déposer plainte" },
  { key: 'notif-register', phase: 'Notifications', label: 'Consigner la violation dans le registre interne', personalData: true },

  { key: 'rex-review', phase: "Retour d'expérience", label: 'Organiser un retour d’expérience avec toutes les parties' },
  { key: 'rex-report', phase: "Retour d'expérience", label: 'Rédiger le rapport final (chronologie, cause, impact, mesures)' },
  { key: 'rex-actions', phase: "Retour d'expérience", label: "Ajouter les actions correctives au plan d'action du client" },
];

export function checklistFor(personalDataInvolved: boolean): ChecklistTemplateItem[] {
  return CHECKLIST_TEMPLATE.filter((item) => !item.personalData || personalDataInvolved);
}

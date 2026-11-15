import { describe, it, expect } from 'vitest';
import { dedupeActions } from '@/lib/audit/dedupe-actions';

describe('dedupeActions', () => {
  it('supprime les reformulations d’une même action', () => {
    const out = dedupeActions([
      { category: 'RGPD', action: 'Tenir à jour le registre des traitements de données personnelles' },
      { category: 'RGPD', action: 'Établir et tenir à jour un registre des traitements de données personnelles' },
      { category: 'RGPD', action: 'Mettre en place le registre des traitements' },
    ]);
    expect(out).toHaveLength(1);
  });
  it('garde des actions différentes', () => {
    const out = dedupeActions([
      { category: 'Technique', action: 'Activer le MFA sur la messagerie et les comptes administrateurs' },
      { category: 'Technique', action: 'Mettre en place des sauvegardes automatiques avec une copie hors site' },
      { category: 'RGPD', action: 'Tenir à jour le registre des traitements' },
    ]);
    expect(out).toHaveLength(3);
  });
  it('garde la première occurrence', () => {
    const out = dedupeActions([
      { category: 'A', action: 'Désigner un délégué à la protection des données (DPO)' },
      { category: 'B', action: 'Désigner officiellement un DPO, délégué à la protection des données' },
    ]);
    expect(out[0].category).toBe('A');
  });
});

describe('dedupeActions — actions « sans source officielle »', () => {
  it('ne fusionne pas des actions différentes qui partagent la même mention', async () => {
    const { UNSOURCED_ACTION_MARK } = await import('@/lib/audit/sources');
    const titles = [
      "Cartographier les risques métiers et du système d'information et mettre la cartographie à jour au moins une fois par an",
      "Choisir un référentiel de conformité adapté à l'activité (par exemple ISO 27001 ou HDS) et planifier la démarche avec un responsable et un calendrier",
      'Nommer officiellement un responsable de la sécurité (interne ou externalisé) et formaliser sa mission par écrit',
      'Lancer une campagne de phishing simulé au moins deux fois par an et accompagner les personnes qui cliquent',
      "Intégrer une formation cybersécurité à l'accueil de chaque nouvel arrivant",
    ].map((t) => ({ action: t + UNSOURCED_ACTION_MARK, category: 'GRC' }));
    expect(dedupeActions(titles)).toHaveLength(5);
  });
});

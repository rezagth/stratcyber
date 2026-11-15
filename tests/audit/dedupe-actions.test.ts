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

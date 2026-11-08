import { describe, expect, it } from 'vitest';
import { POLICY_TYPES } from '@/lib/api/policy-fields';
import { documentVariables, getLibraryDocument, POLICY_LIBRARY, questionsFor, sanitizeValues } from '@/lib/policy/library';
import { MAX_LONG, MAX_SHORT, prefillValues, VARIABLES } from '@/lib/policy/library-variables';
import { extractVariables, fillTemplate } from '@/lib/policy/template-engine';

describe('bibliothèque de modèles de conformité', () => {
  it('a des identifiants uniques et des types connus', () => {
    const ids = POLICY_LIBRARY.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const doc of POLICY_LIBRARY) {
      expect(POLICY_TYPES as readonly string[]).toContain(doc.type);
      expect(doc.name.length).toBeGreaterThan(5);
      expect(doc.description.length).toBeGreaterThan(5);
      expect(doc.content.length).toBeGreaterThan(500);
    }
  });

  it('couvre les neuf documents attendus, un seul par type (le versionnement se fait par type)', () => {
    expect(POLICY_LIBRARY.map((d) => d.id).sort()).toEqual([
      'acces-mots-de-passe', 'charte-informatique', 'confidentialite', 'incident', 'pca-pra',
      'pssi', 'registre-rgpd', 'sauvegarde', 'sous-traitance-rgpd',
    ]);
    const types = POLICY_LIBRARY.map((d) => d.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('décrit chaque variable utilisée, et n’a aucune question inutile', () => {
    const used = new Set(POLICY_LIBRARY.flatMap((d) => documentVariables(d)));
    for (const key of used) expect(VARIABLES, `variable sans question : ${key}`).toHaveProperty(key);
    for (const key of Object.keys(VARIABLES)) expect(used, `question jamais utilisée : ${key}`).toContain(key);
  });

  it('a des accolades équilibrées et aucune interpolation oubliée', () => {
    for (const doc of POLICY_LIBRARY) {
      const open = (doc.content.match(/\{\{/g) ?? []).length;
      const close = (doc.content.match(/\}\}/g) ?? []).length;
      expect(open, doc.id).toBe(close);
      const wellFormed = (doc.content.match(/\{\{\s*[a-zA-Z0-9_]+\s*\}\}/g) ?? []).length;
      expect(wellFormed, doc.id).toBe(open);
      expect(doc.content, doc.id).not.toMatch(/\$\{|undefined|\[object/);
    }
  });

  it('rappelle dans chaque document qu’il faut le faire relire par un juriste', () => {
    for (const doc of POLICY_LIBRARY) expect(doc.content, doc.id).toContain('faire relire par un juriste');
  });

  it("l'accord de sous-traitance contient les clauses obligatoires de l'article 28.3", () => {
    const dpa = getLibraryDocument('sous-traitance-rgpd')!.content;
    for (const needle of [
      'instruction documentée', 'confidentialité', 'article 32', 'autre sous-traitant', "droits des personnes",
      'violation de données', 'supprimer toutes les données', 'audits', 'contraire à la réglementation',
    ]) expect(dpa, needle).toContain(needle);
  });

  it('la procédure d’incident mentionne les délais de 72 h (CNIL) et de 24 h (NIS2)', () => {
    const incident = getLibraryDocument('incident')!.content;
    expect(incident).toContain('72 heures');
    expect(incident).toContain('24 heures');
    expect(incident).toContain('article 33');
  });

  it('se remplit entièrement quand toutes les questions ont une réponse', () => {
    const everything = Object.fromEntries(Object.keys(VARIABLES).map((k) => [k, `valeur-${k}`]));
    for (const doc of POLICY_LIBRARY) {
      expect(extractVariables(fillTemplate(doc.content, everything)), doc.id).toEqual([]);
    }
  });
});

describe('questions de l’assistant', () => {
  it('fusionne et dédoublonne les questions de plusieurs documents', () => {
    const q = questionsFor(['pssi', 'charte-informatique']).map((x) => x.key);
    expect(new Set(q).size).toBe(q.length);
    expect(q[0]).toBe('entreprise');
    expect(q).toContain('contact_securite');
  });
  it('ignore un identifiant inconnu', () => {
    expect(questionsFor(['nope'])).toEqual([]);
  });
});

describe('nettoyage des réponses', () => {
  it('ne garde que des variables connues, de type texte, nettoyées et bornées', () => {
    const out = sanitizeValues({
      entreprise: '  Client X  ', ville: 42, inconnue: 'x', secteur: 'y', rssi: '   ',
      dirigeant: 'a'.repeat(MAX_SHORT + 50), finalites: 'b'.repeat(MAX_LONG + 50),
    });
    expect(out.entreprise).toBe('Client X');
    expect(out).not.toHaveProperty('ville');
    expect(out).not.toHaveProperty('inconnue');
    expect(out).not.toHaveProperty('rssi');
    expect(out.dirigeant).toHaveLength(MAX_SHORT);
    expect(out.finalites).toHaveLength(MAX_LONG);
  });
  it('résiste aux entrées invalides et aux clés dangereuses', () => {
    expect(sanitizeValues(null)).toEqual({});
    expect(sanitizeValues('texte')).toEqual({});
    const out = sanitizeValues(JSON.parse('{"__proto__": "x", "constructor": "y", "entreprise": "A"}'));
    expect(out).toEqual({ entreprise: 'A' });
    expect(({} as Record<string, unknown>).entreprise).toBeUndefined();
  });
  it('préremplit la date au format français et le nom de l’entreprise', () => {
    expect(prefillValues({ name: 'Client X' }, '2026-11-08')).toEqual({ date_effet: '08/11/2026', rssi: 'InfraCyb', entreprise: 'Client X' });
    expect(prefillValues({ name: null }, '2026-11-08')).not.toHaveProperty('entreprise');
  });
});

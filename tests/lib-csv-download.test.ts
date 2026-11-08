import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/utils/csv-download';

describe('toCsv', () => {
  it('sépare les colonnes par « ; » et double les guillemets', () => {
    expect(toCsv([{ a: 'x"y', b: 2 }])).toBe('"a";"b"\r\n"x""y";"2"');
  });
  it('neutralise les formules (injection Excel)', () => {
    expect(toCsv([{ a: '=SOMME(A1)', b: '+1', c: '-2', d: '@cmd' }])).toContain(`"'=SOMME(A1)";"'+1";"'-2";"'@cmd"`);
  });
  it('renvoie une chaîne vide sans ligne', () => {
    expect(toCsv([])).toBe('');
  });
});

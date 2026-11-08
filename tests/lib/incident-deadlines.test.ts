import { describe, expect, it } from 'vitest';
import { computeCrisisDeadlines, formatRemaining, HOUR_MS, URGENT_THRESHOLD_MS } from '@/lib/incidents/deadlines';
import { checklistFor, CHECKLIST_TEMPLATE } from '@/lib/incidents/checklist-template';

const detectedAt = new Date('2026-11-08T08:00:00Z');
const base = { detectedAt, personalDataInvolved: false, earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null, cnilNotifiedAt: null };
const at = (hoursAfter: number) => new Date(detectedAt.getTime() + hoursAfter * HOUR_MS);
const byKey = (list: ReturnType<typeof computeCrisisDeadlines>, key: string) => list.find((d) => d.key === key);

describe('échéances de crise', () => {
  it('place les échéances NIS2 à 24 h, 72 h et 30 jours après la détection', () => {
    const list = computeCrisisDeadlines(base, at(1));
    expect(byKey(list, 'earlyWarning')!.deadline).toEqual(at(24));
    expect(byKey(list, 'notification')!.deadline).toEqual(at(72));
    expect(byKey(list, 'finalReport')!.deadline).toEqual(at(30 * 24));
  });

  it("n'ajoute la notification CNIL que si des données personnelles sont concernées", () => {
    expect(byKey(computeCrisisDeadlines(base, at(1)), 'cnil')).toBeUndefined();
    const withData = computeCrisisDeadlines({ ...base, personalDataInvolved: true }, at(1));
    expect(byKey(withData, 'cnil')!.deadline).toEqual(at(72));
    expect(byKey(withData, 'cnil')!.regulation).toBe('RGPD');
  });

  it('passe de « à venir » à « urgent » puis « dépassée » selon le temps restant', () => {
    const early = (h: number) => byKey(computeCrisisDeadlines(base, at(h)), 'earlyWarning')!;
    expect(early(1).state).toBe('pending');
    expect(early(24 - URGENT_THRESHOLD_MS / HOUR_MS).state).toBe('urgent'); // pile au seuil
    expect(early(23).state).toBe('urgent');
    expect(early(24.01).state).toBe('overdue');
    expect(early(30).remainingMs).toBeLessThan(0);
  });

  it('distingue « fait » (avant échéance) et « fait en retard »', () => {
    const onTime = byKey(computeCrisisDeadlines({ ...base, earlyWarningSentAt: at(10) }, at(100)), 'earlyWarning')!;
    expect(onTime.state).toBe('done');
    expect(onTime.remainingMs).toBeNull();
    const late = byKey(computeCrisisDeadlines({ ...base, earlyWarningSentAt: at(30) }, at(100)), 'earlyWarning')!;
    expect(late.state).toBe('doneLate');
  });

  it("considère comme tenu un envoi exactement à l'échéance", () => {
    expect(byKey(computeCrisisDeadlines({ ...base, earlyWarningSentAt: at(24) }, at(100)), 'earlyWarning')!.state).toBe('done');
  });

  it('formate le temps restant ou dépassé', () => {
    expect(formatRemaining(23 * HOUR_MS + 59 * 60000)).toBe('23 h 59 min');
    expect(formatRemaining(2 * 24 * HOUR_MS + 4 * HOUR_MS)).toBe('2 j 4 h');
    expect(formatRemaining(-(3 * HOUR_MS + 10 * 60000))).toBe('dépassée de 3 h 10 min');
  });
});

describe('modèle de checklist', () => {
  it('a des clés uniques et des phases connues', () => {
    const keys = CHECKLIST_TEMPLATE.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('ajoute les éléments RGPD uniquement si des données personnelles sont concernées', () => {
    const without = checklistFor(false);
    const withData = checklistFor(true);
    expect(without.some((i) => i.personalData)).toBe(false);
    expect(withData.length).toBeGreaterThan(without.length);
    expect(withData.some((i) => i.key === 'notif-cnil')).toBe(true);
  });
});

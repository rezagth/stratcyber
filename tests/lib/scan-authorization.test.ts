// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { authorizationDataProblem, authorizationMissing, launchProblem, type CampaignAuthorization } from '@/lib/scan/authorization';

const now = new Date('2026-11-10T12:00:00Z');
const valid: CampaignAuthorization = {
  status: 'Autorisée',
  authorizedByName: 'Camille Martin', authorizedByRole: 'Dirigeante', authorizationRef: 'Lettre-2026-11-08.pdf',
  authorizedAt: new Date('2026-11-08'), windowStart: new Date('2026-11-09'), windowEnd: new Date('2026-11-20'),
};

describe('launchProblem', () => {
  it('autorise un contrôle avec une autorisation complète, confirmée et dans la période', () => {
    expect(launchProblem(valid, now)).toBeNull();
  });
  it('refuse une campagne non confirmée', () => {
    expect(launchProblem({ ...valid, status: 'Brouillon' }, now)).toMatch(/pas confirmée/);
  });
  it('refuse une campagne terminée ou annulée', () => {
    expect(launchProblem({ ...valid, status: 'Terminée' }, now)).toMatch(/terminée/);
    expect(launchProblem({ ...valid, status: 'Annulée' }, now)).toMatch(/annulée/);
  });
  it('refuse si une information de l\'autorisation manque, même avec le statut « Autorisée »', () => {
    for (const field of ['authorizedByName', 'authorizedByRole', 'authorizationRef', 'authorizedAt', 'windowStart', 'windowEnd'] as const) {
      expect(launchProblem({ ...valid, [field]: null }, now)).toMatch(/incomplète/);
    }
    expect(launchProblem({ ...valid, authorizedByName: '   ' }, now)).toMatch(/incomplète/);
  });
  it('refuse avant le début et après la fin de la période, mais autorise toute la journée de fin', () => {
    expect(launchProblem(valid, new Date('2026-11-08T23:59:00Z'))).toMatch(/pas encore commencé/);
    expect(launchProblem(valid, new Date('2026-11-20T23:59:00Z'))).toBeNull();
    expect(launchProblem(valid, new Date('2026-11-21T00:00:01Z'))).toMatch(/terminée/);
  });
});

describe('authorizationDataProblem', () => {
  const base = { authorizedByName: null, authorizedByRole: null, authorizationRef: null, authorizedAt: null, windowStart: null, windowEnd: null };
  it('refuse une période inversée ou de plus de 90 jours', () => {
    expect(authorizationDataProblem({ ...base, windowStart: new Date('2026-11-20'), windowEnd: new Date('2026-11-10') }, now)).toMatch(/précède/);
    expect(authorizationDataProblem({ ...base, windowStart: new Date('2026-11-01'), windowEnd: new Date('2027-03-01') }, now)).toMatch(/90 jours/);
    expect(authorizationDataProblem({ ...base, windowStart: new Date('2026-11-01'), windowEnd: new Date('2027-01-30') }, now)).toBeNull();
  });
  it('refuse une signature datée du futur', () => {
    expect(authorizationDataProblem({ ...base, authorizedAt: new Date('2026-12-25') }, now)).toMatch(/futur/);
    expect(authorizationDataProblem({ ...base, authorizedAt: new Date('2026-11-10') }, now)).toBeNull();
  });
});

describe('authorizationMissing', () => {
  it('liste ce qui manque', () => {
    expect(authorizationMissing({ authorizedByName: 'A', authorizedByRole: null, authorizationRef: null, authorizedAt: null, windowStart: null, windowEnd: null }))
      .toMatch(/fonction du signataire.*référence.*date de signature.*début.*fin/);
  });
});

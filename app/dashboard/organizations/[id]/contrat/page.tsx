'use client';

import { use as usePromise } from 'react';
import { ContractLauncher } from '@/components/contract/contract-launcher';

/** Lancement de mission : génération, relecture et envoi du contrat (administrateur). */
export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  return <ContractLauncher organizationId={id} />;
}

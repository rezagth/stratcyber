'use client';

import { use as usePromise } from 'react';
import { notFound } from 'next/navigation';
import { ScanDocument } from '@/components/scan/scan-document';

/** Documents imprimables d'une campagne : lettre d'autorisation (« lettre ») et rapport (« rapport »). */
export default function ScanDocumentPage({ params }: { params: Promise<{ id: string; campaignId: string; doc: string }> }) {
  const { id, campaignId, doc } = usePromise(params);
  if (doc !== 'lettre' && doc !== 'rapport') notFound();
  return <ScanDocument organizationId={id} campaignId={campaignId} doc={doc} />;
}

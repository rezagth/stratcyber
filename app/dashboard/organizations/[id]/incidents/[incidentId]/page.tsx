'use client';

import { use as usePromise } from 'react';
import { CrisisRoom } from '@/components/incident/crisis-room';

export default function CrisisRoomPage({ params }: { params: Promise<{ id: string; incidentId: string }> }) {
  const { id, incidentId } = usePromise(params);
  return <CrisisRoom organizationId={id} incidentId={incidentId} />;
}

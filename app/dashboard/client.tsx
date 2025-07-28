'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Audit } from '@prisma/client';

export default function DashboardClient() {
  const { data: session } = useSession();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [lastAudit, setLastAudit] = useState<Audit | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/audits')
        .then(res => res.json())
        .then(data => {
          setAudits(data);
          if (data.length > 0) {
            setLastAudit(data[data.length - 1]);
          }
        });
    }
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dernier audit</h2>
          {lastAudit ? (
            <div>
              <p>Date: {new Date(lastAudit.createdAt).toLocaleDateString()}</p>
              <p>Statut: {lastAudit.status}</p>
            </div>
          ) : (
            <p>Aucun audit disponible</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <p>Nombre total d&apos;audits: {audits.length}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Historique des audits</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {audits.map((audit) => (
                <tr key={audit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(audit.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${audit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={`/audit/${audit.id}`} className="text-indigo-600 hover:text-indigo-900">Voir détails</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
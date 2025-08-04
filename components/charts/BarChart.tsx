"use client";
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Brève description de chaque domaine pour tooltip
const CATEGORY_DESCRIPTIONS: Record<string,string> = {
  Gouvernance: 'Stratégie, politiques et pilotage de la sécurité',
  Technique: 'Mesures et contrôles techniques (pare-feu, patching…)',
  Organisationnel: 'Processus, procédures et responsabilités',
  GRC: 'Gestion des risques et conformité',
  Sensibilisation: 'Formation et culture cybersécurité',
  RGPD: 'Protection des données personnelles',
  Incidents: 'Gestion des incidents et continuité',
  SupplyChain: 'Sécurité des fournisseurs et tiers',
  Cloud: 'Bonnes pratiques dans le cloud',
};

export default function BarChart({ scores }: { scores: Record<string, number> }) {
  const labels = Object.keys(scores);
  const data = {
    labels,
    datasets: [
      {
        label: 'Score par domaine',
        data: Object.values(scores),
        backgroundColor: [
          'rgba(59,130,246,0.7)',
          'rgba(16,185,129,0.7)',
          'rgba(234,179,8,0.7)',
          'rgba(239,68,68,0.7)',
          'rgba(168,85,247,0.7)',
          'rgba(251,191,36,0.7)',
        ],
        borderRadius: 8,
        borderWidth: 1,
      },
    ],
  };
  const options = {
    indexAxis: 'y' as const,
    scales: {
      x: { min: 0, max: 100, ticks: { stepSize: 20 } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw ?? 0;
            const desc = CATEGORY_DESCRIPTIONS[label] ? ` – ${CATEGORY_DESCRIPTIONS[label]}` : '';
            return `${label}: ${value}%${desc}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div style={{ width: '100%', height: 300 }}>
      <Bar data={data} options={options} />
    </div>
  );
} 
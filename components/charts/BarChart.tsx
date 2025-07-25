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
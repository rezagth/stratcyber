"use client";
import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Props = {
  scores: Record<string, number>;
};

export default function RadarChart({ scores }: Props) {
  const labels = Object.keys(scores);
  const data = {
    labels,
    datasets: [
      {
        label: 'Score par domaine',
        data: Object.values(scores),
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59,130,246,1)',
      },
    ],
  };
  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        pointLabels: { font: { size: 14 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div style={{ width: '100%', height: 350 }}>
      <Radar data={data} options={options} />
    </div>
  );
} 
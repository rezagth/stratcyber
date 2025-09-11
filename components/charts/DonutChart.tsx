'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartData } from '@/types/dashboard';

interface DonutChartProps {
  data: ChartData[];
  title?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  centerText?: {
    value: string | number;
    label: string;
  };
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0].payload.totalValue || 100;
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{data.payload.name}</p>
        <p className="text-primary">
          Valeur: <span className="font-bold">{data.value}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {percentage}% du total
        </p>
      </div>
    );
  }
  return null;
};

const renderCenterText = (centerText: { value: string | number; label: string }) => (
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
    <tspan x="50%" dy="-0.5em" className="text-2xl font-bold fill-foreground">
      {centerText.value}
    </tspan>
    <tspan x="50%" dy="1.5em" className="text-sm fill-muted-foreground">
      {centerText.label}
    </tspan>
  </text>
);

export function DonutChart({ 
  data, 
  title, 
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  centerText
}: DonutChartProps) {
  // Calculer le total pour les pourcentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, totalValue: total }));

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ 
                fontSize: '12px',
                paddingTop: '20px'
              }}
            />
          )}
          {centerText && renderCenterText(centerText)}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

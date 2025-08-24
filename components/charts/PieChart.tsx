'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartData } from '@/types/dashboard';

interface PieChartComponentProps {
  data: ChartData[];
  title?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green  
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Ne pas afficher les labels pour les petites valeurs

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{data.payload.name}</p>
        <p className="text-primary">
          Valeur: <span className="font-bold">{data.value}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {((data.value / payload.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export function PieChartComponent({ 
  data, 
  title, 
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80
}: PieChartComponentProps) {
  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

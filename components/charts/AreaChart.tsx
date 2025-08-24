'use client';
import React from 'react';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TimeSeriesData } from '@/types/dashboard';

interface AreaChartProps {
  data: TimeSeriesData[];
  title?: string;
  dataKeys: string[];
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground mb-1">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AreaChart({ 
  data, 
  title, 
  dataKeys, 
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLegend = true,
  height = 300
}: AreaChartProps) {
  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              opacity={0.5}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fillOpacity={1}
              fill={`url(#color${key})`}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

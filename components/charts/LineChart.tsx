'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TimeSeriesData } from '@/types/dashboard';

interface LineChartComponentProps {
  data: TimeSeriesData[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  showArea?: boolean;
  color?: string;
  strokeWidth?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{new Date(label).toLocaleDateString('fr-FR')}</p>
        <p className="text-primary">
          Score: <span className="font-bold">{data.value}%</span>
        </p>
        {data.payload.category && (
          <p className="text-muted-foreground text-sm">
            Catégorie: {data.payload.category}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function LineChartComponent({ 
  data, 
  title,
  xAxisKey = 'date',
  yAxisKey = 'score',
  showArea = false,
  color = '#3b82f6',
  strokeWidth = 2
}: LineChartComponentProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
              month: 'short', 
              day: 'numeric' 
            })}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {showArea ? (
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              strokeWidth={strokeWidth}
              fill={color}
              fillOpacity={0.3}
            />
          ) : (
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={color} 
              strokeWidth={strokeWidth}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

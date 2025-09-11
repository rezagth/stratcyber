'use client';
import React from 'react';

interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  title?: string;
  unit?: string;
  size?: 'small' | 'medium' | 'large';
  colors?: {
    track: string;
    fill: string;
    text: string;
  };
  showValue?: boolean;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

export function GaugeChart({
  value,
  max = 100,
  min = 0,
  title,
  unit = '%',
  size = 'medium',
  colors = {
    track: '#e5e7eb',
    fill: '#3b82f6',
    text: '#1f2937'
  },
  showValue = true,
  thresholds
}: GaugeChartProps) {
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Déterminer la couleur basée sur les seuils
  const getFillColor = () => {
    if (!thresholds) return colors.fill;
    
    if (normalizedValue >= thresholds.high) return '#10b981'; // green
    if (normalizedValue >= thresholds.medium) return '#f59e0b'; // amber
    if (normalizedValue >= thresholds.low) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  // Tailles du gauge
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          size: 120,
          strokeWidth: 8,
          fontSize: '16px',
          titleFontSize: '12px'
        };
      case 'large':
        return {
          size: 200,
          strokeWidth: 12,
          fontSize: '28px',
          titleFontSize: '16px'
        };
      default:
        return {
          size: 160,
          strokeWidth: 10,
          fontSize: '20px',
          titleFontSize: '14px'
        };
    }
  };

  const sizes = getSizes();
  const radius = (sizes.size - sizes.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {title && (
        <h3 
          className="font-semibold mb-4 text-center text-foreground"
          style={{ fontSize: sizes.titleFontSize }}
        >
          {title}
        </h3>
      )}
      
      <div className="relative" style={{ width: sizes.size, height: sizes.size }}>
        <svg
          width={sizes.size}
          height={sizes.size}
          className="transform -rotate-90"
        >
          {/* Track circle */}
          <circle
            cx={sizes.size / 2}
            cy={sizes.size / 2}
            r={radius}
            fill="transparent"
            stroke={colors.track}
            strokeWidth={sizes.strokeWidth}
            className="opacity-20"
          />
          
          {/* Progress circle */}
          <circle
            cx={sizes.size / 2}
            cy={sizes.size / 2}
            r={radius}
            fill="transparent"
            stroke={getFillColor()}
            strokeWidth={sizes.strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className="font-bold text-foreground"
              style={{ fontSize: sizes.fontSize }}
            >
              {normalizedValue.toFixed(0)}{unit}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              sur {max}{unit}
            </span>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {thresholds && (
        <div className="flex items-center gap-2 mt-4">
          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getFillColor() }}></div>
          <span className="text-sm text-muted-foreground">
            {normalizedValue >= thresholds.high ? 'Excellent' :
             normalizedValue >= thresholds.medium ? 'Satisfaisant' :
             normalizedValue >= thresholds.low ? 'À améliorer' : 'Critique'}
          </span>
        </div>
      )}
    </div>
  );
}

'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
  duration?: number;
}

export function ProgressCircle({
  value,
  size = 120,
  strokeWidth = 8,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--muted))',
  showValue = true,
  children,
  className,
  animated = true,
  duration = 1.5
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const center = size / 2;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? strokeDashoffset : circumference - (value / 100) * circumference 
          }}
          transition={{ 
            duration: animated ? duration : 0,
            ease: "easeInOut",
            delay: animated ? 0.2 : 0
          }}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
      </svg>
      
      {/* Content in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && !children && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: animated ? 0.8 : 0, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-foreground">
              {Math.round(value)}%
            </div>
          </motion.div>
        )}
        {children}
      </div>
    </div>
  );
}

// Composant pour un cercle de progression avec des segments
export function SegmentedProgressCircle({
  segments,
  size = 120,
  strokeWidth = 8,
  className,
  animated = true
}: {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
  animated?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  let accumulatedValue = 0;
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        
        {/* Segments */}
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / 100) * circumference;
          const offset = circumference - accumulatedValue - segmentLength;
          accumulatedValue += segmentLength;
          
          return (
            <motion.circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ 
                duration: animated ? 1.5 : 0,
                ease: "easeInOut",
                delay: animated ? index * 0.2 : 0
              }}
            />
          );
        })}
      </svg>
      
      {/* Center content can be customized */}
    </div>
  );
}

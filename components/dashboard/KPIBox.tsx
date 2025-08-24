import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';

interface KPIBoxProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    period: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info';
  progress?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function KPIBox({
  title,
  value,
  unit,
  subtitle,
  trend,
  status = 'info',
  progress,
  icon,
  onClick,
  className = '',
  size = 'medium'
}: KPIBoxProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800';
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-800';
      case 'danger':
        return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-800';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getValueSize = () => {
    switch (size) {
      case 'small':
        return 'text-2xl';
      case 'large':
        return 'text-5xl';
      default:
        return 'text-3xl';
    }
  };

  return (
    <Card 
      className={`${getStatusColors()} shadow-lg hover:shadow-xl transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className={`pb-2 ${getSizeClasses()}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </CardTitle>
          {onClick && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={getSizeClasses()}>
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className={`font-bold ${getValueSize()}`}>
              {value}
            </span>
            {unit && (
              <span className="text-lg font-normal text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-muted-foreground">
                vs {trend.period}
              </span>
            </div>
          )}

          {progress !== undefined && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {progress}% complété
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

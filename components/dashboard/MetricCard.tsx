import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    period: string;
    isGood?: boolean;
  };
  target?: {
    value: number;
    label: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  progress?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  onAction?: () => void;
  className?: string;
  size?: 'compact' | 'default' | 'large';
  variant?: 'default' | 'gradient' | 'outlined';
  alerts?: {
    type: 'warning' | 'danger' | 'info';
    message: string;
  }[];
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  description,
  trend,
  target,
  status = 'neutral',
  progress,
  icon,
  onClick,
  onAction,
  className = '',
  size = 'default',
  variant = 'default',
  alerts = []
}: MetricCardProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          border: 'border-green-200',
          bg: variant === 'gradient' 
            ? 'bg-gradient-to-br from-green-50 to-green-100' 
            : 'bg-green-50',
          text: 'text-green-800',
          accent: 'text-green-600'
        };
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: variant === 'gradient' 
            ? 'bg-gradient-to-br from-amber-50 to-amber-100' 
            : 'bg-amber-50',
          text: 'text-amber-800',
          accent: 'text-amber-600'
        };
      case 'danger':
        return {
          border: 'border-red-200',
          bg: variant === 'gradient' 
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : 'bg-red-50',
          text: 'text-red-800',
          accent: 'text-red-600'
        };
      case 'info':
        return {
          border: 'border-blue-200',
          bg: variant === 'gradient' 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
            : 'bg-blue-50',
          text: 'text-blue-800',
          accent: 'text-blue-600'
        };
      default:
        return {
          border: 'border-gray-200',
          bg: variant === 'gradient' 
            ? 'bg-gradient-to-br from-gray-50 to-gray-100' 
            : 'bg-white',
          text: 'text-gray-800',
          accent: 'text-gray-600'
        };
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const trendColor = trend.isGood !== undefined 
      ? (trend.isGood ? 'text-green-600' : 'text-red-600')
      : (trend.direction === 'up' ? 'text-green-600' : 
         trend.direction === 'down' ? 'text-red-600' : 'text-gray-600');

    switch (trend.direction) {
      case 'up':
        return <TrendingUp className={`h-4 w-4 ${trendColor}`} />;
      case 'down':
        return <TrendingDown className={`h-4 w-4 ${trendColor}`} />;
      default:
        return <Minus className={`h-4 w-4 ${trendColor}`} />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'compact':
        return {
          padding: 'p-3',
          valueSize: 'text-2xl',
          titleSize: 'text-sm',
          spacing: 'space-y-1'
        };
      case 'large':
        return {
          padding: 'p-6',
          valueSize: 'text-4xl',
          titleSize: 'text-lg',
          spacing: 'space-y-4'
        };
      default:
        return {
          padding: 'p-4',
          valueSize: 'text-3xl',
          titleSize: 'text-base',
          spacing: 'space-y-3'
        };
    }
  };

  const colors = getStatusColors();
  const sizeClasses = getSizeClasses();

  const cardClassName = `
    ${colors.bg} ${colors.border} ${colors.text} 
    ${variant === 'outlined' ? 'border-2' : 'border'} 
    shadow-lg hover:shadow-xl transition-all duration-200 
    ${onClick ? 'cursor-pointer hover:scale-105' : ''} 
    ${className}
  `;

  return (
    <Card className={cardClassName} onClick={onClick}>
      <CardHeader className={`pb-2 ${sizeClasses.padding}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${sizeClasses.titleSize} font-medium`}>
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {alerts.map((alert, index) => (
              <AlertCircle 
                key={index} 
                className={`h-4 w-4 ${
                  alert.type === 'danger' ? 'text-red-500' : 
                  alert.type === 'warning' ? 'text-amber-500' : 
                  'text-blue-500'
                }`} 
              />
            ))}
            {onAction && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={sizeClasses.padding}>
        <div className={sizeClasses.spacing}>
          {/* Valeur principale */}
          <div className="flex items-baseline gap-1">
            <span className={`font-bold ${sizeClasses.valueSize} ${colors.text}`}>
              {value}
            </span>
            {unit && (
              <span className="text-lg font-normal text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          
          {/* Sous-titre */}
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}

          {/* Tendance */}
          {trend && (
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${
                trend.isGood !== undefined 
                  ? (trend.isGood ? 'text-green-600' : 'text-red-600')
                  : colors.accent
              }`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs {trend.period}
              </span>
            </div>
          )}

          {/* Objectif */}
          {target && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Objectif: <span className="font-medium">{target.value} {target.label}</span>
              </span>
            </div>
          )}

          {/* Barre de progression */}
          {progress !== undefined && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress}% complété</span>
                {progress >= 100 ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </div>
            </div>
          )}

          {/* Alertes */}
          {alerts.length > 0 && (
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <Badge 
                  key={index}
                  variant={alert.type === 'danger' ? 'destructive' : 
                           alert.type === 'warning' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {alert.message}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

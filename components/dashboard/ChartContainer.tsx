import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  MoreVertical, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  FileImage,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  onExport?: (format: 'png' | 'csv' | 'pdf') => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  error?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  expandable?: boolean;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  className = '',
  actions,
  onExport,
  onRefresh,
  isLoading = false,
  error,
  size = 'medium',
  expandable = false
}: ChartContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSizeClasses = () => {
    if (isExpanded) return 'col-span-full row-span-2';
    
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-2';
      case 'full':
        return 'col-span-full';
      default:
        return 'col-span-1 lg:col-span-1';
    }
  };

  const getHeightClasses = () => {
    if (isExpanded) return 'h-[600px]';
    
    switch (size) {
      case 'small':
        return 'h-[200px]';
      case 'large':
        return 'h-[400px]';
      case 'full':
        return 'h-[500px]';
      default:
        return 'h-[300px]';
    }
  };

  return (
    <Card className={`shadow-lg ${getSizeClasses()} ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {expandable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}

            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport('png')}>
                    <FileImage className="h-4 w-4 mr-2" />
                    Exporter en PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('csv')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exporter en CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter en PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className={`relative ${getHeightClasses()}`}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
              <div className="text-center space-y-2">
                <Badge variant="destructive">Erreur</Badge>
                <p className="text-sm text-muted-foreground">{error}</p>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="h-full w-full">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

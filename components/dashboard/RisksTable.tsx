import React from 'react';
import { InteractiveTable, TableColumn, TableFilter } from './InteractiveTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  Shield, 
  Eye, 
  Edit,
  TrendingUp,
  Target
} from 'lucide-react';
import { DashboardRisk } from '@/types/dashboard';

interface RisksTableProps {
  risks: DashboardRisk[];
  onRowClick?: (risk: DashboardRisk) => void;
  onEdit?: (risk: DashboardRisk) => void;
  onView?: (risk: DashboardRisk) => void;
  onExport?: (format: 'csv' | 'excel') => void;
}

export function RisksTable({ 
  risks, 
  onRowClick, 
  onEdit, 
  onView, 
  onExport 
}: RisksTableProps) {
  const getRiskLevelVariant = (level: string) => {
    switch (level) {
      case 'Critique':
        return 'destructive';
      case 'Élevé':
        return 'destructive';
      case 'Moyen':
        return 'secondary';
      case 'Faible':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Fermé':
        return 'default';
      case 'Mitigé':
        return 'secondary';
      case 'En cours':
        return 'secondary';
      case 'Ouvert':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Critique':
        return <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />;
      case 'Élevé':
        return <TrendingUp className="h-3 w-3 mr-1 text-orange-600" />;
      case 'Moyen':
        return <Target className="h-3 w-3 mr-1 text-yellow-600" />;
      default:
        return <Shield className="h-3 w-3 mr-1 text-green-600" />;
    }
  };

  const getRiskScore = (impact: number, probability: number) => {
    return impact * probability;
  };

  const columns: TableColumn[] = [
    {
      key: 'title',
      label: 'Risque',
      sortable: true,
      width: '25%',
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium text-sm flex items-center">
            {getRiskIcon(row.riskLevel)}
            {value}
          </div>
          {row.description && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {row.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      filterable: true,
      width: '12%',
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'impact',
      label: 'Impact',
      sortable: true,
      width: '8%',
      render: (value) => {
        const color = value >= 4 ? 'text-red-600' : value >= 3 ? 'text-orange-600' : value >= 2 ? 'text-yellow-600' : 'text-green-600';
        return (
          <div className={`text-center font-bold ${color}`}>
            {value}/5
          </div>
        );
      }
    },
    {
      key: 'probability',
      label: 'Probabilité',
      sortable: true,
      width: '10%',
      render: (value) => {
        const color = value >= 4 ? 'text-red-600' : value >= 3 ? 'text-orange-600' : value >= 2 ? 'text-yellow-600' : 'text-green-600';
        return (
          <div className={`text-center font-bold ${color}`}>
            {value}/5
          </div>
        );
      }
    },
    {
      key: 'riskLevel',
      label: 'Niveau de Risque',
      sortable: true,
      filterable: true,
      width: '12%',
      render: (value, row) => {
        const score = getRiskScore(row.impact, row.probability);
        return (
          <div className="space-y-1">
            <Badge variant={getRiskLevelVariant(value)} className="text-xs">
              {value}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Score: {score}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      filterable: true,
      width: '10%',
      render: (value) => (
        <Badge variant={getStatusVariant(value)} className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'mitigationPlan',
      label: 'Plan de Mitigation',
      width: '18%',
      render: (value) => {
        if (!value) {
          return (
            <span className="text-muted-foreground text-xs italic">
              Aucun plan défini
            </span>
          );
        }
        return (
          <div className="text-xs line-clamp-3">
            {value}
          </div>
        );
      }
    },
    {
      key: 'owner',
      label: 'Responsable',
      sortable: true,
      width: '5%',
      render: (value) => {
        if (!value) return <span className="text-muted-foreground text-xs">Non assigné</span>;
        
        const initials = value.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              {initials}
            </div>
            <span className="text-xs truncate">{value}</span>
          </div>
        );
      }
    }
  ];

  const filters: TableFilter[] = [
    {
      key: 'category',
      label: 'Catégorie',
      type: 'select',
      options: [
        ...new Set(risks.map(r => r.category))
      ].map(category => ({
        value: category,
        label: category
      }))
    },
    {
      key: 'riskLevel',
      label: 'Niveau de Risque',
      type: 'select',
      options: [
        { value: 'Critique', label: 'Critique' },
        { value: 'Élevé', label: 'Élevé' },
        { value: 'Moyen', label: 'Moyen' },
        { value: 'Faible', label: 'Faible' }
      ]
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'Ouvert', label: 'Ouvert' },
        { value: 'En cours', label: 'En cours' },
        { value: 'Mitigé', label: 'Mitigé' },
        { value: 'Fermé', label: 'Fermé' }
      ]
    }
  ];

  const handleActions = (row: DashboardRisk) => (
    <div className="flex gap-1">
      {onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-3 w-3" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  return (
    <InteractiveTable
      title="Registre des Risques"
      subtitle="Analyse et suivi des risques cybersécurité identifiés"
      data={risks}
      columns={columns}
      filters={filters}
      searchable={true}
      searchPlaceholder="Rechercher un risque..."
      pageSize={10}
      exportable={!!onExport}
      onRowClick={onRowClick}
      onExport={onExport}
      actions={onView || onEdit ? handleActions : undefined}
    />
  );
}

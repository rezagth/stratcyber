import React from 'react';
import { InteractiveTable, TableColumn, TableFilter } from './InteractiveTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  User, 
  Eye, 
  Edit,
  AlertTriangle,
  Clock 
} from 'lucide-react';
import { DashboardAction } from '@/types/dashboard';

interface ActionsTableProps {
  actions: DashboardAction[];
  onRowClick?: (action: DashboardAction) => void;
  onEdit?: (action: DashboardAction) => void;
  onView?: (action: DashboardAction) => void;
  onExport?: (format: 'csv' | 'excel') => void;
}

export function ActionsTable({ 
  actions, 
  onRowClick, 
  onEdit, 
  onView, 
  onExport 
}: ActionsTableProps) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'Critique':
        return 'destructive';
      case 'Haute':
        return 'destructive';
      case 'Moyenne':
        return 'secondary';
      case 'Basse':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'default';
      case 'En cours':
        return 'secondary';
      case 'En retard':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En retard':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'En cours':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate: Date, status: string) => {
    return new Date() > dueDate && status !== 'Terminé';
  };

  const columns: TableColumn[] = [
    {
      key: 'title',
      label: 'Action',
      sortable: true,
      width: '30%',
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">{value}</div>
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
      label: 'Domaine',
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
      key: 'priority',
      label: 'Priorité',
      sortable: true,
      filterable: true,
      width: '10%',
      render: (value) => (
        <Badge variant={getPriorityVariant(value)} className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      filterable: true,
      width: '12%',
      render: (value) => (
        <Badge variant={getStatusVariant(value)} className="text-xs flex items-center w-fit">
          {getStatusIcon(value)}
          {value}
        </Badge>
      )
    },
    {
      key: 'progress',
      label: 'Progression',
      sortable: true,
      width: '15%',
      render: (value, row) => (
        <div className="space-y-1">
          <Progress value={value} className="h-2" />
          <span className="text-xs text-muted-foreground">{value}%</span>
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      sortable: true,
      width: '10%',
      render: (value, row) => {
        const isLate = isOverdue(new Date(value), row.status);
        return (
          <div className={`text-xs ${isLate ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(value).toLocaleDateString('fr-FR')}
            </div>
            {isLate && (
              <div className="text-red-600 font-bold mt-1">
                En retard
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'owner',
      label: 'Responsable',
      sortable: true,
      width: '11%',
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
      label: 'Domaine',
      type: 'select',
      options: [
        ...new Set(actions.map(a => a.category))
      ].map(category => ({
        value: category,
        label: category
      }))
    },
    {
      key: 'priority',
      label: 'Priorité',
      type: 'select',
      options: [
        { value: 'Critique', label: 'Critique' },
        { value: 'Haute', label: 'Haute' },
        { value: 'Moyenne', label: 'Moyenne' },
        { value: 'Basse', label: 'Basse' }
      ]
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'Non commencé', label: 'Non commencé' },
        { value: 'En cours', label: 'En cours' },
        { value: 'Terminé', label: 'Terminé' },
        { value: 'En retard', label: 'En retard' }
      ]
    }
  ];

  const handleActions = (row: DashboardAction) => (
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
      title="Plan d'Action"
      subtitle="Suivi détaillé des actions prioritaires de cybersécurité"
      data={actions}
      columns={columns}
      filters={filters}
      searchable={true}
      searchPlaceholder="Rechercher une action..."
      pageSize={15}
      exportable={!!onExport}
      onRowClick={onRowClick}
      onExport={onExport}
      actions={onView || onEdit ? handleActions : undefined}
    />
  );
}

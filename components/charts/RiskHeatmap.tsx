'use client';
import React from 'react';
import { HeatmapData } from '@/types/dashboard';

interface RiskHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

const getRiskColor = (level: string) => {
  switch (level) {
    case 'Critique':
      return 'bg-red-600 text-white';
    case 'Élevé':
      return 'bg-orange-500 text-white';
    case 'Moyen':
      return 'bg-yellow-400 text-black';
    case 'Faible':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-200 text-black';
  }
};

const getImpactLabel = (impact: number) => {
  if (impact >= 4) return 'Très élevé';
  if (impact >= 3) return 'Élevé';
  if (impact >= 2) return 'Moyen';
  return 'Faible';
};

const getProbabilityLabel = (probability: number) => {
  if (probability >= 4) return 'Très probable';
  if (probability >= 3) return 'Probable';
  if (probability >= 2) return 'Possible';
  return 'Rare';
};

export function RiskHeatmap({ data, title }: RiskHeatmapProps) {
  // Créer une matrice 5x5 pour la heatmap
  const matrix: HeatmapData[][][] = Array(5).fill(null).map(() => 
    Array(5).fill(null).map(() => [])
  );

  // Remplir la matrice avec les données
  data.forEach(risk => {
    const impactIndex = Math.min(4, Math.max(0, risk.impact - 1));
    const probabilityIndex = Math.min(4, Math.max(0, risk.probability - 1));
    matrix[4 - impactIndex][probabilityIndex].push(risk);
  });

  return (
    <div className="h-full w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      
      <div className="grid grid-cols-6 gap-1 h-full">
        {/* En-tête vide */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">Impact</span>
        </div>
        
        {/* En-têtes de probabilité */}
        {[1, 2, 3, 4, 5].map(prob => (
          <div key={prob} className="flex items-center justify-center p-1">
            <span className="text-xs font-semibold text-center text-muted-foreground">
              {getProbabilityLabel(prob)}
            </span>
          </div>
        ))}

        {/* Lignes de la matrice */}
        {matrix.map((row, impactIndex) => (
          <React.Fragment key={impactIndex}>
            {/* Label d'impact */}
            <div className="flex items-center justify-center p-1">
              <span className="text-xs font-semibold text-center text-muted-foreground transform -rotate-90">
                {getImpactLabel(5 - impactIndex)}
              </span>
            </div>
            
            {/* Cellules de risque */}
            {row.map((cell, probabilityIndex) => {
              const riskLevel = cell.length > 0 ? cell[0].level : 'Faible';
              const riskCount = cell.length;
              
              return (
                <div
                  key={probabilityIndex}
                  className={`
                    relative aspect-square border border-gray-300 rounded cursor-pointer 
                    transition-all hover:scale-105 hover:shadow-lg
                    ${getRiskColor(riskLevel)}
                    ${riskCount === 0 ? 'opacity-20' : ''}
                  `}
                  title={`${riskCount} risque(s) - ${riskLevel}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {riskCount > 0 ? riskCount : ''}
                    </span>
                  </div>
                  
                  {/* Tooltip avec les détails des risques */}
                  {riskCount > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-background border border-border rounded-lg shadow-lg p-2 max-w-xs">
                        <p className="font-semibold text-sm mb-1">
                          {riskCount} risque(s) - {riskLevel}
                        </p>
                        {cell.slice(0, 3).map((risk, index) => (
                          <p key={index} className="text-xs text-muted-foreground truncate">
                            • {risk.risk}
                          </p>
                        ))}
                        {cell.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            ... et {cell.length - 3} autre(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Légende */}
      <div className="mt-4 flex justify-center">
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Faible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Moyen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Élevé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Critique</span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-xs text-muted-foreground">
          Probabilité →
        </span>
      </div>
    </div>
  );
}

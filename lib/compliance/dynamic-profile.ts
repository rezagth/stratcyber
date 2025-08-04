import { CompanyProfile, CompanySector, CompanySize, RegulationScope, AuditQuestion } from '../../types/audit';
import { getQuestionsForProfile } from '../audit/questions-extended';
import { getApplicableRegulations } from './company-profile';

// Nouveau système de profil dynamique
export interface EnhancedCompanyProfile extends CompanyProfile {
  industry: CompanySector;
  employeeCount: number;
  annualRevenue: number;
  dataProcessingVolume: 'LOW' | 'MEDIUM' | 'HIGH';
  internationalOperations: boolean;
  cloudUsage: 'NONE' | 'BASIC' | 'EXTENSIVE';
  criticalInfrastructure: boolean;
  paymentProcessing: boolean;
  healthDataProcessing: boolean;
  financialServices: boolean;
  publicSector: boolean;
  supplierCount: number;
  remoteWorkforce: number;
}

export function createDynamicQuestionnaire(profile: EnhancedCompanyProfile): AuditQuestion[] {
  const applicableRegulations = getApplicableRegulations(profile);
  const baseQuestions = getQuestionsForProfile(applicableRegulations, profile.sector);
  
  // Questions spécifiques selon l'activité
  const dynamicQuestions: AuditQuestion[] = [];
  
  // Assurance - Questions spécialisées
  if (profile.sector === 'Finance' && profile.financialServices) {
    dynamicQuestions.push(
      {
        id: 'insurance_1',
        category: 'Secteur',
        question: "Les données d'assurance sont-elles protégées selon Solvabilité II ?",
        description: "Conformité aux exigences de protection des données d'assurance.",
        type: 'scale',
        weight: 3,
      },
      {
        id: 'insurance_2',
        category: 'RGPD',
        question: "Le consentement pour l'utilisation des données de santé en assurance est-il conforme ?",
        description: "Gestion spécifique du consentement pour les données sensibles.",
        type: 'boolean',
        weight: 3,
      }
    );
  }
  
  // Santé - Questions HDS et données sensibles
  if (profile.sector === 'Santé' || profile.healthDataProcessing) {
    dynamicQuestions.push(
      {
        id: 'health_security_1',
        category: 'Secteur',
        question: "La traçabilité des accès aux dossiers patients est-elle assurée ?",
        description: "Audit trail complet pour tous les accès aux données de santé.",
        type: 'scale',
        weight: 3,
      }
    );
  }
  
  // Questions selon la taille
  if (profile.employeeCount > 250) {
    dynamicQuestions.push(
      {
        id: 'enterprise_1',
        category: 'Gouvernance',
        question: "Un comité de cybersécurité au niveau direction générale est-il constitué ?",
        description: "Gouvernance cybersécurité au plus haut niveau.",
        type: 'boolean',
        weight: 2,
      }
    );
  }
  
  return [...baseQuestions, ...dynamicQuestions];
}

export function generateComplianceRoadmap(profile: EnhancedCompanyProfile, auditResults: Record<string, string>) {
  const roadmap = [];
  const regulations = getApplicableRegulations(profile);
  
  // Feuille de route spécifique par secteur
  if (profile.sector === 'Finance') {
    roadmap.push({
      phase: 'Phase 1 - Conformité DORA',
      duration: '6 mois',
      actions: [
        'Mise en place du framework de gestion des risques TIC',
        'Implémentation des tests de résilience',
        'Notification des incidents aux autorités'
      ],
      budget: 150000,
      priority: 'CRITICAL'
    });
  }
  
  if (regulations.includes('RGPD')) {
    roadmap.push({
      phase: 'Phase 2 - Mise en conformité RGPD',
      duration: '4 mois',
      actions: [
        'Nomination du DPO',
        'Cartographie des traitements',
        'Mise en place des procédures de droits'
      ],
      budget: 80000,
      priority: 'HIGH'
    });
  }
  
  return roadmap;
}
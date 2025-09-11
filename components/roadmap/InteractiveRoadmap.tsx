'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  ChevronRight,
  ChevronDown,
  BarChart3,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ActionPlanItem, Milestone, RoadmapQuarter } from '../../types/actionPlan';
import complianceDocs from '../../app/compliance/docs';

interface InteractiveRoadmapProps {
  quarters: RoadmapQuarter[];
  actions: ActionPlanItem[];
  milestones: Milestone[];
}

// Fonction pour afficher le titre de l'action comme dans le dashboard
const getDisplayTitle = (action: ActionPlanItem): string => {
  // Utiliser directement action.action qui contient le contenu détaillé
  return action.action || action.title;
};

// Fonction pour générer des sous-tâches automatiquement si elles n'existent pas
const generateSubTasks = (action: ActionPlanItem) => {
  if (action.subTasks && action.subTasks.length > 0) {
    return action.subTasks;
  }
  
  // Générer des sous-tâches spécifiques basées sur le contenu de l'action
  const actionText = action.action || action.title || '';
  const category = action.category;
  
  let specificSubTasks: { title: string; hours: number; status: string }[] = [];
  
  // Sous-tâches spécialisées par type d'action avec explications détaillées
  if (actionText.includes('notification') && actionText.includes('CNIL')) {
    specificSubTasks = [
      { title: 'Analyser les obligations légales de notification CNIL (Art. 33-34 RGPD) - Étudier les critères déclenchant une notification (risque élevé, nature des données, nombre de personnes)', hours: 8, status: 'Non commencé' },
      { title: 'Rédiger les procédures de détection des violations de données - Définir les indicateurs techniques (logs, alertes) et organisationnels (signalements) pour identifier une violation', hours: 12, status: 'Non commencé' },
      { title: 'Définir le processus de notification dans les 72h à la CNIL - Créer le workflow d\'escalade, désigner les responsables, préparer les modèles de déclaration', hours: 16, status: 'Non commencé' },
      { title: 'Créer les modèles de notification pour les personnes concernées - Rédiger les courriers/emails d\'information adaptés selon le type de violation et le public cible', hours: 10, status: 'Non commencé' },
      { title: 'Former le personnel à la détection et signalement des incidents - Organiser des sessions pour les équipes IT, RH et métiers sur l\'identification des violations', hours: 12, status: 'Non commencé' },
      { title: 'Mettre en place un registre des violations de données - Créer un système de documentation centralisé avec horodatage, nature, impacts et mesures correctives', hours: 6, status: 'Non commencé' },
      { title: 'Tester le processus avec des cas pratiques et simulations - Organiser des exercices de crise cyber avec chronométrage des délais de notification', hours: 8, status: 'Non commencé' }
    ];
  } else if (actionText.includes('procédure') && actionText.includes('droits')) {
    specificSubTasks = [
      { title: 'Cartographier les droits des personnes concernées - Détailler les droits d\'accès, rectification, effacement, portabilité, opposition et limitation avec leurs conditions d\'exercice', hours: 8, status: 'Non commencé' },
      { title: 'Créer les formulaires web d\'exercice des droits RGPD - Développer des interfaces utilisateur sécurisées avec vérification d\'identité et accusé de réception automatique', hours: 12, status: 'Non commencé' },
      { title: 'Définir les délais de réponse légaux - Implémenter le suivi automatisé des délais (1 mois standard, prolongeable à 3 mois si complexité avec justification)', hours: 6, status: 'Non commencé' },
      { title: 'Mettre en place le workflow automatisé de traitement - Créer un système de ticketing avec attribution automatique aux services concernés et escalade en cas de retard', hours: 16, status: 'Non commencé' },
      { title: 'Créer les modèles de réponse certifiés conformes - Rédiger les templates de réponse validés juridiquement pour chaque type de demande (positive, négative, partielle)', hours: 10, status: 'Non commencé' },
      { title: 'Former les équipes métier au traitement des demandes RGPD - Organiser des sessions pratiques sur les procédures, outils et obligations légales pour chaque service', hours: 8, status: 'Non commencé' },
      { title: 'Mettre en place le suivi et reporting des demandes - Créer des tableaux de bord temps réel avec KPIs (délais moyens, taux de satisfaction, types de demandes)', hours: 6, status: 'Non commencé' }
    ];
  } else if (actionText.includes('formation') && actionText.includes('personnel')) {
    specificSubTasks = [
      { title: 'Évaluer les besoins de formation par équipe', hours: 12, status: 'Non commencé' },
      { title: 'Développer les supports de formation adaptés', hours: 20, status: 'Non commencé' },
      { title: 'Planifier les sessions de formation', hours: 8, status: 'Non commencé' },
      { title: 'Organiser les formations en présentiel/distanciel', hours: 16, status: 'Non commencé' },
      { title: 'Évaluer l\'efficacité des formations', hours: 6, status: 'Non commencé' }
    ];
  } else if (actionText.includes('registre') && actionText.includes('traitement')) {
    specificSubTasks = [
      { title: 'Inventorier tous les traitements de données existants par service', hours: 24, status: 'Non commencé' },
      { title: 'Documenter chaque traitement : finalités, bases légales, catégories de données', hours: 20, status: 'Non commencé' },
      { title: 'Identifier les destinataires internes et externes des données', hours: 10, status: 'Non commencé' },
      { title: 'Identifier et documenter tous les transferts de données hors UE', hours: 12, status: 'Non commencé' },
      { title: 'Définir les durées de conservation pour chaque traitement', hours: 8, status: 'Non commencé' },
      { title: 'Mettre en place le registre informatisé (outil dédié ou tableur)', hours: 16, status: 'Non commencé' },
      { title: 'Former les référents métier à la mise à jour du registre', hours: 6, status: 'Non commencé' },
      { title: 'Planifier la revue trimestrielle du registre', hours: 4, status: 'Non commencé' }
    ];
  } else {
    // Templates génériques par catégorie en fallback - OBLIGATOIRES POUR TOUTES LES ACTIONS
    const subTaskTemplates = {
      'SupplyChain': [
        { title: 'Cartographier et classer les fournisseurs par criticité - Inventorier tous les prestataires, sous-traitants et fournisseurs IT en les classant selon leur niveau d\'accès aux systèmes et données critiques', hours: 16, status: 'Non commencé' },
        { title: 'Définir la grille d\'évaluation sécurité des fournisseurs - Créer un questionnaire standardisé incluant certifications ISO 27001, SOC2, politique de sécurité, gestion des incidents', hours: 12, status: 'Non commencé' },
        { title: 'Réaliser l\'audit de sécurité des fournisseurs critiques - Conduire des audits sur site ou distants avec revue documentaire, tests techniques et validation des mesures de protection', hours: 24, status: 'Non commencé' },
        { title: 'Former les équipes achats aux risques cyber - Sensibiliser aux enjeux de cybersécurité dans les contrats, critères d\'évaluation des fournisseurs et signaux d\'alerte', hours: 8, status: 'Non commencé' },
        { title: 'Intégrer les clauses de cybersécurité dans tous les contrats - Rédiger et négocier les clauses de sécurité, notification d\'incident, audit, résilience et responsabilité', hours: 20, status: 'Non commencé' },
        { title: 'Mettre en place la surveillance continue des fournisseurs - Déployer la veille automatisée sur les incidents, vulnérabilités et actualités sécuritaires des prestataires', hours: 6, status: 'Non commencé' }
      ],
      'CRA': [
        { title: 'Analyser les exigences du Cyber Resilience Act pour vos produits', hours: 20, status: 'Non commencé' },
        { title: 'Identifier les produits numériques concernés par le CRA', hours: 12, status: 'Non commencé' },
        { title: 'Mettre en place la cybersécurité by design dans le développement', hours: 32, status: 'Non commencé' },
        { title: 'Établir la documentation technique de sécurité requise', hours: 24, status: 'Non commencé' },
        { title: 'Développer le processus de gestion des vulnérabilités', hours: 28, status: 'Non commencé' },
        { title: 'Préparer la déclaration de conformité CE pour vos produits', hours: 16, status: 'Non commencé' },
        { title: 'Former les équipes R&D aux exigences CRA', hours: 12, status: 'Non commencé' }
      ],
      'NIS2': [
        { title: 'Évaluer l\'applicabilité NIS2 - Analyser votre secteur d\'activité (énergie, transport, santé, finance...) et taille d\'entreprise pour déterminer si vous êtes une entité essentielle ou importante', hours: 8, status: 'Non commencé' },
        { title: 'Mettre en place la gouvernance cybersécurité NIS2 - Désigner un responsable cybersécurité au niveau direction, créer le comité de pilotage et définir les politiques de sécurité', hours: 24, status: 'Non commencé' },
        { title: 'Développer les mesures techniques proportionnées - Implémenter l\'authentification multi-facteurs, chiffrement, sauvegarde, gestion des vulnérabilités et supervision réseau selon votre niveau de risque', hours: 40, status: 'Non commencé' },
        { title: 'Établir le processus de signalement d\'incidents - Créer les procédures de détection, classification et notification des incidents significatifs aux autorités nationales dans les 24h', hours: 16, status: 'Non commencé' },
        { title: 'Sécuriser la chaîne d\'approvisionnement numérique - Évaluer et surveiller les risques de cybersécurité des fournisseurs critiques, inclure des exigences dans les contrats', hours: 32, status: 'Non commencé' },
        { title: 'Former la direction aux responsabilités NIS2 - Organiser des sessions de formation pour les dirigeants sur leurs obligations personnelles et les sanctions encourues', hours: 12, status: 'Non commencé' },
        { title: 'Mettre en place la surveillance continue - Déployer des outils de monitoring réseau, analyse des logs et détection d\'anomalies avec reporting automatisé des incidents', hours: 20, status: 'Non commencé' }
      ],
      'DORA': [
        { title: 'Évaluer l\'applicabilité de DORA à votre secteur financier', hours: 12, status: 'Non commencé' },
        { title: 'Mettre en place le framework de gestion des risques TIC', hours: 40, status: 'Non commencé' },
        { title: 'Développer la stratégie de résilience opérationnelle numérique', hours: 32, status: 'Non commencé' },
        { title: 'Établir les tests de résilience réguliers (TLPT)', hours: 24, status: 'Non commencé' },
        { title: 'Créer le registre des incidents et des mesures correctives', hours: 16, status: 'Non commencé' },
        { title: 'Gérer les risques liés aux fournisseurs TIC tiers', hours: 28, status: 'Non commencé' },
        { title: 'Former les équipes aux exigences DORA', hours: 12, status: 'Non commencé' }
      ],
      'LPM': [
        { title: 'Analyser les obligations de la Loi de Programmation Militaire', hours: 16, status: 'Non commencé' },
        { title: 'Identifier les systèmes d\'information d\'importance vitale (SIIV)', hours: 12, status: 'Non commencé' },
        { title: 'Mettre en place la détection des événements de sécurité', hours: 28, status: 'Non commencé' },
        { title: 'Établir les procédures de signalement à l\'ANSSI', hours: 16, status: 'Non commencé' },
        { title: 'Renforcer la sécurité des systèmes critiques', hours: 32, status: 'Non commencé' },
        { title: 'Former le personnel aux obligations LPM', hours: 12, status: 'Non commencé' },
        { title: 'Effectuer les audits de sécurité périodiques', hours: 20, status: 'Non commencé' }
      ],
      'Incidents': [
        { title: 'Créer l\'équipe de réponse aux incidents (CSIRT)', hours: 16, status: 'Non commencé' },
        { title: 'Rédiger le plan de réponse aux incidents cybersécurité', hours: 24, status: 'Non commencé' },
        { title: 'Mettre en place les outils de détection et d\'analyse forensique', hours: 32, status: 'Non commencé' },
        { title: 'Établir les procédures d\'escalade et de communication', hours: 12, status: 'Non commencé' },
        { title: 'Former l\'équipe CSIRT aux techniques d\'investigation', hours: 20, status: 'Non commencé' },
        { title: 'Tester le plan avec des exercices de simulation d\'incident', hours: 16, status: 'Non commencé' },
        { title: 'Créer les modèles de rapport d\'incident', hours: 8, status: 'Non commencé' }
      ],
      'Cloud': [
        { title: 'Auditer la configuration sécurité de vos environnements cloud', hours: 20, status: 'Non commencé' },
        { title: 'Implémenter la gestion des identités et accès cloud (IAM)', hours: 24, status: 'Non commencé' },
        { title: 'Configurer le chiffrement des données au repos et en transit', hours: 16, status: 'Non commencé' },
        { title: 'Mettre en place la surveillance et logging cloud (CSPM)', hours: 18, status: 'Non commencé' },
        { title: 'Sécuriser les API et interfaces cloud', hours: 14, status: 'Non commencé' },
        { title: 'Établir la gouvernance multi-cloud/hybride', hours: 22, status: 'Non commencé' },
        { title: 'Former les équipes aux bonnes pratiques cloud security', hours: 12, status: 'Non commencé' }
      ],
      'RGPD': [
        { title: 'Analyser les exigences réglementaires spécifiques', hours: 16, status: 'Non commencé' },
        { title: 'Documenter les processus et procédures', hours: 20, status: 'Non commencé' },
        { title: 'Former les équipes concernées', hours: 12, status: 'Non commencé' },
        { title: 'Mettre en œuvre les mesures techniques', hours: 24, status: 'Non commencé' },
        { title: 'Tester et valider la conformité', hours: 16, status: 'Non commencé' }
      ],
      'Gouvernance': [
        { title: 'Définir la politique générale de sécurité', hours: 32, status: 'Non commencé' },
        { title: 'Créer le comité de pilotage cybersécurité', hours: 16, status: 'Non commencé' },
        { title: 'Établir les rôles et responsabilités', hours: 24, status: 'Non commencé' },
        { title: 'Mettre en place le processus de gestion des risques', hours: 40, status: 'Non commencé' }
      ],
      'Technique': [
        { title: 'Réaliser l\'audit de sécurité de l\'infrastructure (scan vulnérabilités)', hours: 20, status: 'Non commencé' },
        { title: 'Déployer les solutions EDR/XDR sur tous les postes', hours: 24, status: 'Non commencé' },
        { title: 'Mettre en place la sauvegarde automatisée et chiffrée (3-2-1)', hours: 16, status: 'Non commencé' },
        { title: 'Configurer le SIEM/SOC et les alertes de sécurité', hours: 24, status: 'Non commencé' },
        { title: 'Durcir la configuration des serveurs et postes (CIS Benchmarks)', hours: 20, status: 'Non commencé' },
        { title: 'Mettre en place la segmentation réseau et micro-segmentation', hours: 32, status: 'Non commencé' },
        { title: 'Tester la détection d\'intrusion avec des scénarios d\'attaque', hours: 16, status: 'Non commencé' }
      ],
      'Organisationnel': [
        { title: 'Rédiger la charte informatique et de sécurité', hours: 16, status: 'Non commencé' },
        { title: 'Définir le processus de gestion des accès', hours: 24, status: 'Non commencé' },
        { title: 'Établir les procédures d\'incident', hours: 20, status: 'Non commencé' },
        { title: 'Planifier les audits réguliers', hours: 12, status: 'Non commencé' }
      ],
      'Sensibilisation': [
        { title: 'Évaluer le niveau de sensibilisation actuel (enquête baseline)', hours: 8, status: 'Non commencé' },
        { title: 'Créer les supports de formation par métier (RH, Finance, Commercial)', hours: 32, status: 'Non commencé' },
        { title: 'Développer le parcours e-learning cybersécurité', hours: 24, status: 'Non commencé' },
        { title: 'Organiser les sessions de formation en présentiel par équipe', hours: 24, status: 'Non commencé' },
        { title: 'Lancer les campagnes mensuelles de sensibilisation (affiches, emails)', hours: 16, status: 'Non commencé' },
        { title: 'Déployer une plateforme de phishing simulé interne', hours: 8, status: 'Non commencé' },
        { title: 'Lancer les campagnes de phishing simulé hebdomadaires', hours: 12, status: 'Non commencé' },
        { title: 'Mesurer l\'efficacité : taux de clic, signalements, quiz', hours: 6, status: 'Non commencé' }
      ],
      // Catégories supplémentaires pour couvrir TOUS les cas possibles
      'GRC': [
        { title: 'Établir le processus de gestion des risques cybersécurité', hours: 32, status: 'Non commencé' },
        { title: 'Créer le registre des risques et des mesures de traitement', hours: 20, status: 'Non commencé' },
        { title: 'Mettre en place les indicateurs de risque (KRI)', hours: 16, status: 'Non commencé' },
        { title: 'Développer la méthodologie d\'évaluation des risques', hours: 24, status: 'Non commencé' },
        { title: 'Former les équipes à la gestion des risques cyber', hours: 12, status: 'Non commencé' },
        { title: 'Effectuer l\'analyse d\'impact métier (BIA)', hours: 20, status: 'Non commencé' },
        { title: 'Établir le reporting risques pour la direction', hours: 8, status: 'Non commencé' }
      ],
      'Secteur': [
        { title: 'Analyser les exigences réglementaires spécifiques à votre secteur', hours: 16, status: 'Non commencé' },
        { title: 'Identifier les bonnes pratiques sectorielles de cybersécurité', hours: 12, status: 'Non commencé' },
        { title: 'Adapter les mesures de sécurité aux risques métier', hours: 24, status: 'Non commencé' },
        { title: 'Établir la veille réglementaire sectorielle', hours: 8, status: 'Non commencé' },
        { title: 'Former les équipes aux spécificités sectorielles', hours: 16, status: 'Non commencé' },
        { title: 'Mettre en place les contrôles sectoriels obligatoires', hours: 20, status: 'Non commencé' },
        { title: 'Effectuer l\'audit de conformité sectorielle', hours: 18, status: 'Non commencé' }
      ]
    };
    
    // S'assurer qu'il y a TOUJOURS des sous-tâches
    specificSubTasks = subTaskTemplates[category as keyof typeof subTaskTemplates] || [];
    
    // Si encore aucune sous-tâche trouvée, utiliser un template générique universel
    if (specificSubTasks.length === 0) {
      specificSubTasks = [
        { title: `Analyser les exigences et besoins pour ${category}`, hours: 16, status: 'Non commencé' },
        { title: `Définir la stratégie et les objectifs pour ${category}`, hours: 12, status: 'Non commencé' },
        { title: `Mettre en place les mesures techniques pour ${category}`, hours: 24, status: 'Non commencé' },
        { title: `Développer les processus et procédures pour ${category}`, hours: 20, status: 'Non commencé' },
        { title: `Former les équipes concernées par ${category}`, hours: 16, status: 'Non commencé' },
        { title: `Effectuer les tests et validations pour ${category}`, hours: 12, status: 'Non commencé' },
        { title: `Établir le suivi et reporting pour ${category}`, hours: 8, status: 'Non commencé' }
      ];
    }
  }
  
  return specificSubTasks.map((template, index) => ({
    id: `${action.id}-subtask-${index}`,
    title: template.title,
    estimatedHours: template.hours,
    status: template.status
  }));
};

// Fonction pour améliorer l'affichage des descriptions
const getDisplayDescription = (action: ActionPlanItem): string => {
  const originalDesc = action.description || "";
  
  // Si la description est générique ou courte, on l'améliore avec des informations contextuelles
  if (originalDesc.includes("Formation du personnel sur les points faibles identifiés") || originalDesc.length < 100) {
    const category = action.category;
    const progress = action.progress;
    
    if (category === 'SupplyChain') {
      return `Formation ciblée du personnel sur la sécurisation de la chaîne d'approvisionnement. Progression: ${progress}%. Cette formation couvre les risques liés aux fournisseurs, la sécurisation des échanges et les bonnes pratiques de gestion des tiers.`;
    } else if (category === 'RGPD') {
      return `Mise en place urgente des mesures de sécurité pour RGPD. Score actuel: ${progress}%. Cette action comprend la révision des processus de traitement des données personnelles, la mise à jour des mentions d'information et la formation du personnel concerné.`;
    } else if (category === 'Gouvernance') {
      return `Renforcement du cadre de gouvernance cybersécurité. Progression: ${progress}%. Formalisation des politiques de sécurité, clarification des rôles et responsabilités, amélioration du reporting sécurité.`;
    } else if (category === 'Technique') {
      return `Amélioration de la sécurité technique de l'infrastructure. Avancement: ${progress}%. Mise à jour des systèmes de sécurité, déploiement d'outils de protection et correction des vulnérabilités identifiées.`;
    } else if (category === 'Organisationnel') {
      return `Optimisation des processus organisationnels de sécurité. Progression: ${progress}%. Formation du personnel, révision des processus opérationnels et amélioration de la gestion des accès.`;
    } else if (category === 'Sensibilisation') {
      return `Développement du programme de sensibilisation cybersécurité. Avancement: ${progress}%. Formation ciblée, campagnes de sensibilisation et tests de phishing simulé.`;
    }
  }
  
  return originalDesc;
};

const TimelineItem = ({ 
  action, 
  isExpanded, 
  onToggle 
}: { 
  action: ActionPlanItem;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-500';
      case 'En cours': return 'bg-blue-500';
      case 'En retard': return 'bg-red-500';
      case 'Bloqué': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critique': return 'destructive';
      case 'Haute': return 'secondary';
      case 'Moyenne': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="relative">
      {/* Ligne de connexion */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border"></div>
      
      <div className="flex items-start space-x-4 pb-6">
        {/* Indicateur de statut */}
        <div className={`w-8 h-8 rounded-full ${getStatusColor(action.status)} flex items-center justify-center z-10`}>
          {action.status === 'Terminé' ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <Clock className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Contenu de l'action */}
        <div className="flex-1 min-w-0">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="p-0 h-auto"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <CardTitle className="text-lg">{getDisplayTitle(action)}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(action.priority)}>
                    {action.priority}
                  </Badge>
                  <Badge variant="outline">{action.category}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground">{getDisplayDescription(action)}</p>
                
                {/* Métriques principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Échéance</p>
                      <p className="text-sm font-medium">
                        {action.dueDate instanceof Date ? action.dueDate.toLocaleDateString('fr-FR') : new Date(action.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Responsable</p>
                      <p className="text-sm font-medium">{action.owner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm font-medium">
                        {action.budget ? `${action.budget.toLocaleString()}€` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Progression</p>
                      <p className="text-sm font-medium">{action.progress}%</p>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avancement</span>
                    <span>{action.progress}%</span>
                  </div>
                  <Progress value={action.progress} className="h-2" />
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Impact business et contexte réglementaire */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Impact Business & Conformité
                        </h4>
                        <p className="text-sm text-muted-foreground">{action.businessImpact}</p>
                        
                        {/* Contexte réglementaire spécifique */}
                        {(() => {
                          const category = action.category;
                          let regulatoryContext = "";
                          
                          if (category === 'RGPD') {
                            regulatoryContext = "⚖️ Conformité RGPD obligatoire - Risque d'amendes jusqu'à 4% du CA ou 20M€";
                          } else if (category === 'NIS2') {
                            regulatoryContext = "🏛️ Directive NIS2 - Obligations pour les entités essentielles et importantes";
                          } else if (category === 'Technique') {
                            regulatoryContext = "🔒 Mesures techniques de sécurité - ISO 27001 et bonnes pratiques ANSSI";
                          } else if (category === 'Gouvernance') {
                            regulatoryContext = "📋 Gouvernance cyber - Exigence des régulateurs et des assureurs";
                          }
                          
                          return regulatoryContext && (
                            <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                              <p className="text-sm text-blue-800">{regulatoryContext}</p>
                            </div>
                          );
                        })()} 
                      </div>
                    </div>

                    {/* Sous-tâches - Utiliser les sous-tâches générées automatiquement */}
                    {(() => {
                      const subTasks = generateSubTasks(action);
                      return (
                        <div>
                          <h4 className="font-medium mb-2">Actions à effectuer ({subTasks.length})</h4>
                          <div className="space-y-2">
                            {subTasks.map((subTask, index) => (
                              <div key={subTask.id} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(subTask.status)} flex-shrink-0`}></div>
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{index + 1}. {subTask.title}</span>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Durée estimée: {subTask.estimatedHours}h • Statut: {subTask.status}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Ressources et outils recommandés */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Ressources Recommandées
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          const category = action.category;
                          let resources: { name: string; type: string; description: string; link?: string; isInternal?: boolean }[] = [];
                          
                          // Ajouter automatiquement la documentation interne si disponible
                          const docForCategory = complianceDocs[category];
                          if (docForCategory) {
                            resources.push({
                              name: docForCategory.title,
                              type: "Documentation Interne",
                              description: docForCategory.description,
                              link: docForCategory.link,
                              isInternal: true
                            });
                          }
                          
                          // Ajouter les ressources spécifiques par catégorie
                          if (category === 'RGPD') {
                            resources.push(
                              { name: "CNIL - Guide pratique", type: "Documentation Officielle", description: "Guides officiels de la Commission Nationale de l'Informatique et des Libertés", link: "https://www.cnil.fr/fr/rgpd-guide-du-sous-traitant" }
                            );
                          } else if (category === 'NIS2') {
                            resources.push(
                              { name: "Texte officiel NIS2", type: "Directive EU", description: "Directive (UE) 2022/2555 du Parlement européen", link: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32022L2555" },
                              { name: "Guide ANSSI NIS2", type: "Guide Officiel", description: "Guide d'accompagnement ANSSI pour la directive NIS2", link: "https://www.ssi.gouv.fr" },
                              { name: "Auto-évaluation NIS2", type: "Outil ENISA", description: "Questionnaire d'auto-évaluation de la conformité NIS2", link: "https://www.enisa.europa.eu/topics/cybersecurity-policy/nis-directive-new" }
                            );
                          } else if (category === 'Technique') {
                            resources.push(
                              { name: "Solutions EDR/XDR", type: "Catégorie Solution", description: "CrowdStrike, SentinelOne, Microsoft Defender, Carbon Black, etc." },
                              { name: "Guides ANSSI", type: "Documentation", description: "Recommandations de sécurité numérique", link: "https://www.ssi.gouv.fr/guide/" },
                              { name: "CIS Controls", type: "Framework", description: "20 contrôles de sécurité critiques", link: "https://www.cisecurity.org/controls" }
                            );
                          } else if (category === 'Sensibilisation') {
                            resources.push(
                              { name: "SecNumAcadémie ANSSI", type: "MOOC Gratuit", description: "Formation en ligne gratuite de l'ANSSI", link: "https://secnumacademie.gouv.fr" }
                            );
                          } else if (category === 'Cloud') {
                            resources.push(
                              { name: "Guide ANSSI Cloud", type: "Guide Officiel", description: "Recommandations de sécurité pour le cloud", link: "https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique/" },
                              { name: "SecNumCloud", type: "Qualification ANSSI", description: "Services cloud qualifiés par l'ANSSI", link: "https://www.ssi.gouv.fr/entreprise/qualification/prestataires-de-services-de-confiance-qualifies/" }
                            );
                          } else if (category === 'DORA') {
                            resources.push(
                              { name: "Texte officiel DORA", type: "Règlement UE", description: "Règlement (UE) 2022/2554 sur la résilience opérationnelle numérique", link: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32022R2554" },
                              { name: "Guide EBA DORA", type: "Guide Officiel", description: "Guidelines de l'Autorité bancaire européenne", link: "https://www.eba.europa.eu/regulation-and-policy/operational-resilience" },
                              { name: "Templates DORA", type: "Ressources StratCyber", description: "Registres et modèles de documentation DORA disponibles sur la plateforme" }
                            );
                          } else if (category === 'Gouvernance') {
                            resources.push(
                              { name: "ISO 27001:2022", type: "Norme Internationale", description: "Standard de référence pour le management de la sécurité", link: "https://www.iso.org/standard/27001" },
                              { name: "NIST Cybersecurity Framework", type: "Framework", description: "Framework de cybersécurité du NIST", link: "https://www.nist.gov/cyberframework" },
                              { name: "Guide ANSSI Gouvernance", type: "Guide Officiel", description: "Recommandations ANSSI pour la gouvernance cyber", link: "https://www.ssi.gouv.fr/guide/" }
                            );
                          } else if (category === 'Organisationnel') {
                            resources.push(
                              { name: "Méthode EBIOS Risk Manager", type: "Méthodologie", description: "Méthode d'analyse des risques cyber", link: "https://www.ssi.gouv.fr/guide/ebios-risk-manager-la-methode/" },
                              { name: "Bibliothèque de templates", type: "Ressources StratCyber", description: "Modèles de politiques et procédures disponibles sur la plateforme" },
                              { name: "Guide CLUSIF", type: "Guide Professionnel", description: "Méthodes et outils du CLUSIF", link: "https://clusif.fr/" }
                            );
                          } else if (category === 'Incidents') {
                            resources.push(
                              { name: "Guide ANSSI Gestion de crise", type: "Guide Officiel", description: "Gestion de crise d'origine cyber", link: "https://www.ssi.gouv.fr/guide/gestion-de-crise-dorigine-cyber/" },
                              { name: "CERT-FR Alertes", type: "Veille Sécurité", description: "Bulletins d'alerte du CERT français", link: "https://www.cert.ssi.gouv.fr/" },
                              { name: "MITRE ATT&CK", type: "Base de Connaissance", description: "Tactiques et techniques d'attaquants", link: "https://attack.mitre.org/" }
                            );
                          } else if (category === 'GRC') {
                            resources.push(
                              { name: "ISO 31000", type: "Norme Internationale", description: "Management du risque - Lignes directrices", link: "https://www.iso.org/iso-31000-risk-management.html" },
                              { name: "COSO Framework", type: "Framework", description: "Contrôle interne et gestion des risques", link: "https://www.coso.org/" },
                              { name: "Guide AMRAE Cyber", type: "Guide Professionnel", description: "Association pour le management des risques", link: "https://www.amrae.fr/" }
                            );
                          } else {
                            resources.push(
                              { name: "ANSSI Bonnes pratiques", type: "Guide Officiel", description: "Recommandations générales de cybersécurité", link: "https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique/" },
                              { name: "NIST SP 800 Series", type: "Standards", description: "Publications spéciales du NIST sur la cybersécurité", link: "https://csrc.nist.gov/publications/sp800" },
                              { name: "Centre de formation ANSSI", type: "Formation", description: "Formations officielles en cybersécurité", link: "https://www.ssi.gouv.fr/particulier/formations/" }
                            );
                          }
                          
                          return (
                            <div className="grid grid-cols-1 gap-3">
                              {resources.map((resource, index) => (
                                <div key={index} className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                                  resource.isInternal ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={resource.isInternal ? 'default' : 'secondary'} className="text-xs">
                                          {resource.type}
                                        </Badge>
                                        <span className="text-sm font-medium">{resource.name}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                                    </div>
                                    {resource.link && (
                                      resource.isInternal ? (
                                        <Link href={resource.link} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <BookOpen className="w-4 h-4" />
                                          </Button>
                                        </Link>
                                      ) : (
                                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <ExternalLink className="w-4 h-4" />
                                          </Button>
                                        </a>
                                      )
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()} 
                      </div>
                    </div>
                    
                    {/* KPIs */}
                    {action.kpis.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Indicateurs de Succès
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {action.kpis.map((kpi, index) => (
                            <div key={index} className="p-2 bg-green-50 border border-green-200 rounded">
                              <Badge variant="outline" className="text-xs text-green-700">
                                📊 {kpi}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const QuarterView = ({ quarter }: { quarter: RoadmapQuarter }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{quarter.quarter}</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">{quarter.budget.toLocaleString()}€</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jalons</p>
              <p className="font-medium">{quarter.milestones.length}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quarter.focusAreas.map((area) => (
            <Badge key={area} variant="secondary">{area}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quarter.milestones.map((milestone) => (
            <Card key={milestone.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{milestone.title}</h4>
                  <Badge variant={milestone.status === 'Terminé' ? 'default' : 'outline'}>
                    {milestone.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Échéance: {milestone.dueDate instanceof Date ? milestone.dueDate.toLocaleDateString('fr-FR') : new Date(milestone.dueDate).toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function InteractiveRoadmap({ quarters, actions, milestones }: InteractiveRoadmapProps) {
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'timeline' | 'quarters'>('timeline');

  const toggleActionExpansion = (actionId: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  // Trier les actions par date de début
  const sortedActions = [...actions].sort((a, b) => {
    const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
    const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Contrôles de vue */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Feuille de Route Interactive</h2>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Vue Timeline
          </Button>
          <Button
            variant={viewMode === 'quarters' ? 'default' : 'outline'}
            onClick={() => setViewMode('quarters')}
          >
            Vue Trimestrielle
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Actions Totales</p>
                <p className="text-xl font-bold">{actions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-xl font-bold">
                  {actions.filter(a => a.status === 'Terminé').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-xl font-bold">
                  {actions.filter(a => a.priority === 'Critique').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Jalons</p>
                <p className="text-xl font-bold">{milestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      {viewMode === 'timeline' ? (
        <Card>
          <CardHeader>
            <CardTitle>Timeline des Actions</CardTitle>
            <p className="text-muted-foreground">
              Cliquez sur les actions pour voir les détails
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {sortedActions.map((action) => (
                <TimelineItem
                  key={action.id}
                  action={action}
                  isExpanded={expandedActions.has(action.id)}
                  onToggle={() => toggleActionExpansion(action.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {quarters.map((quarter) => (
            <QuarterView key={quarter.quarter} quarter={quarter} />
          ))}
        </div>
      )}
    </div>
  );
}

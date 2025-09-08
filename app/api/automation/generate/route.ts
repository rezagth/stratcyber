import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Templates de génération automatique
const documentTemplates = {
  'cnil-procedure': {
    name: 'Procédure CNIL 72h',
    type: 'document_generation',
    requiredInputs: ['company_info', 'data_types', 'systems', 'contacts'],
    generateContent: (inputs: any) => {
      const { company_info, data_types, systems, contacts } = inputs;
      
      return {
        mainDocument: `
# PROCÉDURE DE NOTIFICATION DES VIOLATIONS DE DONNÉES
## ${company_info.name} - Secteur ${company_info.sector}

### 1. CONTEXTE RÉGLEMENTAIRE
- Article 33 du RGPD - Notification à l'autorité de contrôle
- Article 34 du RGPD - Communication à la personne concernée  
- Délai: 72 heures maximum après prise de connaissance

### 2. PROCESSUS DE DÉTECTION
**Surveillance des systèmes:**
${systems.map((sys: string) => `- Monitoring ${sys}`).join('\n')}

**Types de données concernées:**
${data_types.map((type: string) => `- ${type}`).join('\n')}

### 3. WORKFLOW D'ESCALADE
1. **Détection** (Équipe IT) → 
2. **Évaluation** (${contacts.itManager}) → 
3. **Notification DPO** (${contacts.dpoName}) → 
4. **Décision** (Direction)

**Délais internes:**
- IT Manager → DPO: 2h maximum
- DPO → Direction: 4h maximum  
- Notification CNIL: 72h maximum

### 4. MODÈLE DE NOTIFICATION CNIL
**Informations obligatoires:**
- Nature de la violation
- Catégories de données concernées
- Nombre approximatif de personnes
- Conséquences probables
- Mesures prises ou envisagées

### 5. COMMUNICATION AUX PERSONNES CONCERNÉES
**Critères de notification:**
- Risque élevé pour les droits et libertés
- Impact sur la vie privée
- Données sensibles compromises

### 6. REGISTRE DES VIOLATIONS
Tenir un registre documentant:
- Date et nature de la violation
- Faits, effets et mesures correctives
- Communication aux autorités et personnes
        `,
        
        checklist: [
          'Identifier la nature de la violation de données',
          'Évaluer les risques pour les personnes concernées', 
          'Contacter le DPO dans les 2h',
          'Prendre des mesures immédiates de sécurisation',
          'Documenter tous les faits dans le registre',
          'Notifier la CNIL si requis (72h max)',
          'Informer les personnes concernées si nécessaire',
          'Analyser les causes et renforcer la sécurité'
        ],
        
        emailTemplate: `
Objet: Notification violation de données - ${company_info.name}

Madame, Monsieur,

Nous vous informons qu'un incident de sécurité survenu le [DATE] a pu affecter certaines de vos données personnelles.

**Nature de l'incident:** [DESCRIPTION]
**Données concernées:** [TYPES_DONNEES] 
**Mesures prises:** [ACTIONS_CORRECTIVES]

Contact: ${contacts.dpoName} - ${contacts.dpoEmail}

Cordialement,
${company_info.name}
        `
      };
    }
  },

  'registre-rgpd': {
    name: 'Registre RGPD',
    type: 'document_generation',
    requiredInputs: ['business_processes', 'data_flows', 'retention_periods'],
    generateContent: (inputs: any) => {
      const { business_processes, data_flows, retention_periods } = inputs;
      
      return {
        mainDocument: `
# REGISTRE DES TRAITEMENTS DE DONNÉES PERSONNELLES
## Article 30 du RGPD

### TRAITEMENT N°1: GESTION CLIENTÈLE
**Finalité:** Gestion de la relation client
**Base légale:** Exécution du contrat
**Catégories de données:** Identité, coordonnées, données contractuelles
**Destinataires:** Service commercial, comptabilité
**Transferts hors UE:** Aucun
**Durée de conservation:** ${retention_periods.clients || '5 ans après fin contrat'}

### TRAITEMENT N°2: GESTION RH  
**Finalité:** Administration du personnel
**Base légale:** Obligations légales + intérêt légitime
**Catégories de données:** État civil, coordonnées, paie, formation
**Destinataires:** RH, comptabilité, médecine du travail
**Durée de conservation:** ${retention_periods.employees || '5 ans après départ'}

### TRAITEMENT N°3: MARKETING
**Finalité:** Prospection commerciale
**Base légale:** Consentement
**Catégories de données:** Identité, coordonnées, préférences
**Destinataires:** Service marketing
**Durée de conservation:** ${retention_periods.prospects || '3 ans sans contact'}

### MESURES DE SÉCURITÉ
- Chiffrement des données sensibles
- Contrôle d'accès par profil utilisateur
- Sauvegarde quotidienne chiffrée
- Formation annuelle du personnel
        `,
        
        checklist: [
          'Inventorier tous les traitements de données par service',
          'Documenter les finalités et bases légales',
          'Identifier tous les destinataires internes/externes', 
          'Vérifier les transferts hors Union Européenne',
          'Définir les durées de conservation',
          'Mettre à jour le registre trimestriellement',
          'Former les référents métier'
        ]
      };
    }
  },

  'programme-sensibilisation': {
    name: 'Programme de Sensibilisation',
    type: 'training_program', 
    requiredInputs: ['company_size', 'sector', 'risk_level'],
    generateContent: (inputs: any) => {
      const { company_size, sector, risk_level } = inputs;
      
      return {
        mainDocument: `
# PROGRAMME DE SENSIBILISATION CYBERSÉCURITÉ
## Adapté pour ${company_size} - Secteur ${sector}

### OBJECTIFS
- Sensibiliser 100% du personnel aux risques cyber
- Réduire les incidents de sécurité liés au facteur humain
- Créer une culture de sécurité dans l'entreprise

### MODULE 1: BASES DE LA CYBERSÉCURITÉ (1h)
**Public:** Tous les collaborateurs
**Fréquence:** Annuelle + nouveaux arrivants
**Contenu:**
- Les principales menaces (phishing, malware, ransomware)
- Bonnes pratiques mots de passe
- Navigation sécurisée sur internet
- Utilisation sécurisée de l'email

### MODULE 2: RGPD ET PROTECTION DES DONNÉES (45min)
**Public:** Tous les collaborateurs manipulant des données
**Contenu:**
- Principes du RGPD
- Droits des personnes
- Procédures en cas de violation
- Bonnes pratiques de traitement

### MODULE 3: SÉCURITÉ MOBILE (30min)
**Public:** Utilisateurs d'équipements mobiles
**Contenu:**
- Sécurisation des appareils
- Applications professionnelles autorisées
- Connexions Wi-Fi sécurisées
- Signalement de perte/vol

### MODULE 4: INCIDENTS ET SIGNALEMENT (20min)  
**Public:** Tous les collaborateurs
**Contenu:**
- Identifier un incident de sécurité
- Procédures de signalement
- Contacts d'urgence
- Ne pas paniquer, agir vite

### PLANNING ANNUEL
- **Janvier:** Lancement programme + Module 1
- **Avril:** Module 2 (RGPD)
- **Juin:** Test phishing simulé
- **Septembre:** Module 3 (Mobile)
- **Novembre:** Module 4 + évaluation annuelle

### MÉTHODES PÉDAGOGIQUES
- E-learning interactif (60%)
- Sessions en présentiel (30%)
- Simulations et exercices (10%)

### INDICATEURS DE SUCCÈS
- Taux de participation: >95%
- Score moyen aux quiz: >80%
- Réduction incidents: -50% vs année N-1
- Temps de signalement: <2h moyenne
        `,
        
        checklist: [
          'Valider le programme avec la direction',
          'Planifier les sessions de formation',
          'Créer les supports pédagogiques',
          'Mettre en place la plateforme e-learning',
          'Former les formateurs internes',
          'Lancer la communication interne',
          'Organiser les premiers tests de phishing',
          'Mesurer et ajuster le programme'
        ]
      };
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { actionId, automationType, inputs } = body;

    if (!actionId || !automationType) {
      return NextResponse.json(
        { error: 'Action ID et type d\'automatisation requis' },
        { status: 400 }
      );
    }

    // Vérifier que le template existe
    const template = documentTemplates[automationType as keyof typeof documentTemplates];
    if (!template) {
      return NextResponse.json(
        { error: 'Type d\'automatisation non supporté' },
        { status: 400 }
      );
    }

    console.log(`🤖 Génération automatique lancée:`, {
      userId: session.user.id,
      actionId,
      type: automationType
    });

    // Générer le contenu
    const generatedContent = template.generateContent(inputs);

    // Simuler un temps de génération
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      actionId,
      type: automationType,
      generated: {
        title: template.name,
        content: generatedContent,
        generatedAt: new Date().toISOString(),
        documents: [
          `${template.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
          `Checklist_${template.name.replace(/\s+/g, '_')}.xlsx`,
          `Template_Email_${Date.now()}.docx`
        ]
      },
      message: `${template.name} générée avec succès !`
    });

  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Retourner la liste des types d'automatisation disponibles
    const availableTypes = Object.entries(documentTemplates).map(([key, template]) => ({
      id: key,
      name: template.name,
      type: template.type,
      requiredInputs: template.requiredInputs
    }));

    return NextResponse.json({
      availableTypes,
      count: availableTypes.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des types:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Building2, Shield, FileText } from 'lucide-react';
import { saveAudit } from '@/app/strategie/actions';
import { CompanyProfile, AuditQuestion, AuditCategory } from '@/types/audit';
import { generateQuestionsForProfile, computeAuditResult, generateActionPlan } from '../../lib/audit/engine';
import { getApplicableRegulations } from '../../lib/compliance/company-profile';

// Schéma de validation pour le profil d'entreprise
const profileSchema = z.object({
  sector: z.enum(['Finance', 'Santé', 'Énergie', 'Transport', 'Numérique', 'Administration', 'Industrie', 'Commerce', 'Autre']),
  size: z.enum(['TPE', 'PME', 'ETI', 'GE']),
  isOIV: z.boolean().optional(),
  isOSE: z.boolean().optional(),
  isFinancial: z.boolean().optional(),
  hasPersonalData: z.boolean(),
  hasCriticalInfra: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const defaultProfile: CompanyProfile = {
  sector: 'Autre',
  size: 'PME',
  isOIV: false,
  isOSE: false,
  isFinancial: false,
  hasPersonalData: true,
  hasCriticalInfra: false,
  applicableRegulations: [],
};

const sectorIcons = {
  Finance: '🏦',
  Santé: '🏥',
  Énergie: '⚡',
  Transport: '🚛',
  Numérique: '💻',
  Administration: '🏛️',
  Industrie: '🏭',
  Commerce: '🛒',
  Autre: '🏢'
};

const categoryColors = {
  Gouvernance: 'bg-blue-100 text-blue-800',
  Technique: 'bg-green-100 text-green-800',
  Organisationnel: 'bg-purple-100 text-purple-800',
  GRC: 'bg-orange-100 text-orange-800',
  Sensibilisation: 'bg-pink-100 text-pink-800',
  RGPD: 'bg-red-100 text-red-800',
  NIS2: 'bg-indigo-100 text-indigo-800',
  DORA: 'bg-yellow-100 text-yellow-800',
  CRA: 'bg-teal-100 text-teal-800',
  LPM: 'bg-gray-100 text-gray-800',
  Incidents: 'bg-rose-100 text-rose-800',
  SupplyChain: 'bg-cyan-100 text-cyan-800',
  Cloud: 'bg-sky-100 text-sky-800',
  Secteur: 'bg-emerald-100 text-emerald-800'
};

interface ImprovedAuditFormProps {
  initialProfile?: CompanyProfile;
}

export default function ImprovedAuditForm({ initialProfile }: ImprovedAuditFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'profile' | 'questions' | 'loading'>('profile');
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile || defaultProfile);
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const {
    control,
    handleSubmit: handleSubmitQuestions,
    reset: resetQuestions,
    watch,
  } = useForm<{ answers: { questionId: string; answer: string; score?: number }[] }>({
    defaultValues: { answers: [] },
  });

  const watchedAnswers = watch('answers');
  const progress = watchedAnswers?.filter((a) => a.answer && a.answer.trim() !== '').length || 0;
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? (progress / totalQuestions) * 100 : 0;

  // Grouper les questions par catégorie
  const questionsByCategory = questions.reduce((acc, question) => {
    if (!acc[question.category]) acc[question.category] = [];
    acc[question.category].push(question);
    return acc;
  }, {} as Record<AuditCategory, AuditQuestion[]>);

  useEffect(() => {
    if (profile?.sector) {
      const generated = generateQuestionsForProfile(profile);
      setQuestions(generated);

      resetQuestions({
        answers: generated.map((q) => ({
          questionId: q.id,
          answer: '',
          score: 0,
        })),
      });
    }
  }, [profile, resetQuestions]);

  const onSubmitProfile: SubmitHandler<ProfileFormData> = (data) => {
    const baseProfile = {
      ...data,
      isOIV: data.isOIV || false,
      isOSE: data.isOSE || false,
      isFinancial: data.isFinancial || false,
      hasCriticalInfra: data.hasCriticalInfra || false,
      applicableRegulations: [] // temporaire
    };
    
    // Calculer les réglementations applicables selon le profil
    const applicableRegs = getApplicableRegulations(baseProfile);
    const updatedProfile = {
      ...baseProfile,
      applicableRegulations: applicableRegs
    };
    
    setProfile(updatedProfile);
    setStep('questions');
  };

  const onSubmitAnswers: SubmitHandler<{ answers: { questionId: string; answer: string; score?: number }[] }> = async (data) => {
    setIsSubmitting(true);
    setStep('loading');

    try {
      // Calculer les scores pour chaque réponse
      const answersWithScores = data.answers.map((answer, index) => {
        const question = questions[index];
        let score = 0;
        
        if (question?.type === 'boolean') {
          score = answer.answer.toLowerCase() === 'oui' ? 5 : 0;
        } else if (question?.type === 'scale') {
          const num = parseInt(answer.answer);
          score = isNaN(num) ? 0 : num; // expect 1-5
        } else if (question?.type === 'choice' && question.options) {
          const optionIndex = question.options.indexOf(answer.answer);
          score = optionIndex >= 0 ? ((optionIndex + 1) / question.options.length) * 5 : 0;
        }
        
        return {
          questionId: answer.questionId,
          answer: answer.answer,
          score
        };
      });

      const finalResult = computeAuditResult(answersWithScores);
      const finalActionPlan = generateActionPlan(finalResult, answersWithScores);

      const auditData = {
        profile,
        answers: answersWithScores,
        result: finalResult,

        actionPlan: finalActionPlan as any, // cast for type compatibility
      };

      const result = await saveAudit(auditData);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        console.error('Erreur lors de la sauvegarde:', result.error);
        alert("Erreur lors de la sauvegarde de l'audit. Veuillez réessayer.");
        setStep('questions');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert("Erreur lors de la soumission de l'audit. Veuillez réessayer.");
      setStep('questions');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h3 className="text-lg font-semibold">Finalisation de votre audit...</h3>
              <p className="text-gray-600">Calcul des scores et génération du plan d'action</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Audit de Cybersécurité</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Évaluez la maturité cybersécurité de votre organisation selon les dernières réglementations
          </p>
          
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step === 'profile' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Profil</span>
              {step !== 'profile' && <CheckCircle className="h-4 w-4" />}
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step === 'questions' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
              <FileText className="h-4 w-4" />
              <span className="font-medium">Questions</span>
            </div>
          </div>
        </div>

        {/* Étape 1: Profil de l'entreprise */}
        {step === 'profile' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Profil de votre organisation</span>
              </CardTitle>
              <CardDescription>
                Ces informations nous permettront d'adapter l'audit à votre contexte réglementaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Secteur d'activité */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Secteur d'activité</label>
                    <Controller
                      control={profileForm.control}
                      name="sector"
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(sectorIcons).map(([sector, icon]) => (
                            <button
                              key={sector}
                              type="button"
                              onClick={() => field.onChange(sector)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                field.value === sector
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-2xl mb-1">{icon}</div>
                              <div className="text-xs font-medium">{sector}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Taille de l'entreprise */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Taille de l'organisation</label>
                    <Controller
                      control={profileForm.control}
                      name="size"
                      render={({ field }) => (
                        <div className="space-y-2">
                          {[
                            { value: 'TPE', label: 'TPE (< 10 employés)', icon: '👥' },
                            { value: 'PME', label: 'PME (10-249 employés)', icon: '🏢' },
                            { value: 'ETI', label: 'ETI (250-4999 employés)', icon: '🏬' },
                            { value: 'GE', label: 'Grande Entreprise (≥ 5000)', icon: '🏭' }
                          ].map((size) => (
                            <button
                              key={size.value}
                              type="button"
                              onClick={() => field.onChange(size.value)}
                              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                field.value === size.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{size.icon}</span>
                                <span className="font-medium">{size.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Caractéristiques spéciales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Caractéristiques de votre organisation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'hasPersonalData', label: 'Traitement de données personnelles', icon: '🔒', required: true },
                      { name: 'isFinancial', label: 'Secteur financier (banque, assurance)', icon: '💰' },
                      { name: 'isOIV', label: 'Opérateur d\'Importance Vitale (OIV)', icon: '🏛️' },
                      { name: 'isOSE', label: 'Opérateur de Services Essentiels (OSE)', icon: '⚡' },
                      { name: 'hasCriticalInfra', label: 'Infrastructure critique', icon: '🔧' }
                    ].map((characteristic) => (
                      <Controller
                        key={characteristic.name}
                        control={profileForm.control}
                        name={characteristic.name as keyof ProfileFormData}
                        render={({ field }) => (
                          <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!field.value}
                              onChange={e => field.onChange(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-lg">{characteristic.icon}</span>
                            <span className="font-medium text-gray-700">{characteristic.label}</span>
                            {characteristic.required && <Badge variant="secondary">Obligatoire</Badge>}
                          </label>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continuer vers l'audit
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Questions d'audit */}
        {step === 'questions' && (
          <div className="space-y-6">
            {/* Barre de progression */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression de l'audit</span>
                  <span className="text-sm text-gray-500">{progress}/{totalQuestions} questions</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </CardContent>
            </Card>

            {/* Questions par catégorie */}
            <form onSubmit={handleSubmitQuestions(onSubmitAnswers)} className="space-y-6">
              {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                <Card key={category} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className={categoryColors[category as AuditCategory] || 'bg-gray-100 text-gray-800'}>
                        {category}
                      </Badge>
                      <span className="text-sm text-gray-500">({categoryQuestions.length} questions)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categoryQuestions.map((question, globalIndex) => {
                      const questionIndex = questions.findIndex(q => q.id === question.id);
                      return (
                        <div key={question.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-900 mb-1">{question.question}</h4>
                            {question.description && (
                              <p className="text-sm text-gray-600">{question.description}</p>
                            )}
                          </div>
                          
                          <Controller
                            control={control}
                            name={`answers.${questionIndex}.answer`}
                            render={({ field }) => {
                              switch (question.type) {
                                case 'boolean':
                                  return (
                                    <div className="flex space-x-4">
                                      {['oui', 'non'].map((option) => (
                                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            value={option}
                                            checked={field.value === option}
                                            onChange={field.onChange}
                                            className="text-blue-600 focus:ring-blue-500"
                                          />
                                          <span className="capitalize font-medium">{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  );
                                case 'scale':
                                  return (
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm text-gray-600">
                                        <span>Très faible</span>
                                        <span>Très élevé</span>
                                      </div>
                                      <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                          <label key={value} className="flex flex-col items-center cursor-pointer">
                                            <input
                                              type="radio"
                                              value={value.toString()}
                                              checked={field.value === value.toString()}
                                              onChange={field.onChange}
                                              className="text-blue-600 focus:ring-blue-500 mb-1"
                                            />
                                            <span className="text-sm font-medium">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                case 'choice':
                                  return (
                                    <div className="space-y-2">
                                      {question.options?.map((option) => (
                                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            value={option}
                                            checked={field.value === option}
                                            onChange={e => field.onChange(e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
                                          />
                                          <span>{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  );
                                default:
                                  return (
                                    <input
                                      type="text"
                                      {...field}
                                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Votre réponse..."
                                    />
                                  );
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={progress < totalQuestions || isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Finalisation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finaliser l'audit ({progress}/{totalQuestions})
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { saveAudit } from '@/app/strategie/actions';
import { ActionItem, RegulationScope } from '@/types/audit';
import { CompanyProfile, AuditQuestion, AuditCategory } from '@/types/audit';
import { generateQuestionsForProfile, computeAuditResult, generateActionPlan } from '../../lib/audit/engine';

// Schéma de validation
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

interface AdaptiveAuditFormProps {
  initialProfile?: CompanyProfile;
}

export default function AdaptiveAuditForm({ initialProfile }: AdaptiveAuditFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'profile' | 'questions' | 'review'>('profile');
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile || defaultProfile);
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [questionsByCategory, setQuestionsByCategory] = useState<Record<AuditCategory, AuditQuestion[]>>({} as Record<AuditCategory, AuditQuestion[]>);

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
  const currentResult = watchedAnswers ? computeAuditResult(watchedAnswers) : null;
  const actionPlan = currentResult ? generateActionPlan(currentResult, watchedAnswers) : [];

  useEffect(() => {
    if (profile?.sector) {
      const generated = generateQuestionsForProfile(profile);
      setQuestions(generated);

      const grouped = generated.reduce((acc: Record<AuditCategory, AuditQuestion[]>, question) => {
        if (!acc[question.category]) acc[question.category] = [];
        acc[question.category].push(question);
        return acc;
      }, {} as Record<AuditCategory, AuditQuestion[]>);

      setQuestionsByCategory(grouped);

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
    setProfile({
      ...data,
      isOIV: data.isOIV || false,
      isOSE: data.isOSE || false,
      isFinancial: data.isFinancial || false,
      hasCriticalInfra: data.hasCriticalInfra || false,
      applicableRegulations: [],
    });
    setStep('questions');
  };

  const onSubmitAnswers: SubmitHandler<{ answers: { questionId: string; answer: string; score?: number }[] }> = async (data) => {
    // Calculate scores for each answer
    const answersWithScores = data.answers.map((a) => {
      const question = questions.find(q => q.id === a.questionId);
      const score = question ? computeScore(question, a.answer) : 0;
      return {
        ...a,
        score
      };
    });
    
    const finalResult = computeAuditResult(answersWithScores);
    const finalActionPlan = generateActionPlan(finalResult, answersWithScores);

    // Convert ActionPlanItem[] to ActionItem[]
    const convertedActionPlan = finalActionPlan.map(item => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      title: item.action,
      description: item.action,
      category: item.category,
      priority: item.priority === 'Haute' ? 'HIGH' as const : 
                item.priority === 'Moyenne' ? 'MEDIUM' as const : 'LOW' as const,
      isMandatory: item.priority === 'Haute',
      regulation: item.compliance?.[0] as RegulationScope | undefined,
      deadline: new Date(item.deadline),
      estimatedDuration: '30 jours',
      owner: item.owner,
      status: item.status === 'Terminé' ? 'DONE' as const : 
              item.status === 'En cours' ? 'IN_PROGRESS' as const : 'TODO' as const,
    }));

    const auditData = {
      profile,
      answers: answersWithScores.map(a => ({
        questionId: a.questionId,
        answer: a.answer,
        score: a.score || 0,
      })),
      result: finalResult,
      actionPlan: convertedActionPlan,
    };

    try {
      const result = await saveAudit(auditData);
      if (result.success) {
        router.push('/dashboard');
      } else {
        console.error('Erreur lors de la sauvegarde:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const computeScore = (question: AuditQuestion, answer: string): number => {
    if (!answer) return 0;
    const trimmed = answer.trim();

    // Échelle 0-5 directement saisie
    if (question.type === 'scale') {
      const num = Number(trimmed);
      return isNaN(num) ? 0 : num;
    }

    // Booléen oui/non
    if (question.type === 'boolean') {
      const val = trimmed.toLowerCase();
      return val === 'oui' || val === 'yes' || val === 'true' ? 5 : 0;
    }

    // Choix multiples – si la valeur est un nombre, l’utiliser ; sinon proportionnel à l’index
    if (question.type === 'choice' && question.options) {
      const numeric = Number(trimmed);
      if (!isNaN(numeric) && numeric >= 0 && numeric <= 5) {
        return numeric;
      }
      const idx = question.options.map(o => o.toLowerCase()).indexOf(trimmed.toLowerCase());
      return idx >= 0 && question.options.length > 1
        ? Math.round((idx / (question.options.length - 1)) * 5)
        : 0;
    }

    // Par défaut, réponse texte => score moyen
    return 3;
  };

  return (
    <div className="p-6">
      {step === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
          <div>
            <label>Secteur</label>
            <select
              value={profile.sector}
              onChange={(e) => setProfile({ ...profile, sector: e.target.value as CompanyProfile['sector'] })}
              className="w-full p-2 border rounded"
            >
              {['Finance', 'Santé', 'Énergie', 'Transport', 'Numérique', 'Administration', 'Industrie', 'Commerce', 'Autre'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Taille</label>
            <select
              value={profile.size}
              onChange={(e) => setProfile({ ...profile, size: e.target.value as CompanyProfile['size'] })}
              className="w-full p-2 border rounded"
            >
              {['TPE', 'PME', 'ETI', 'GE'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label>
              <input type="checkbox" checked={profile.hasPersonalData} onChange={(e) => setProfile({ ...profile, hasPersonalData: e.target.checked })} />
              Données personnelles
            </label>
            <label>
              <input type="checkbox" checked={profile.isFinancial} onChange={(e) => setProfile({ ...profile, isFinancial: e.target.checked })} />
              Secteur financier
            </label>
            <label>
              <input type="checkbox" checked={profile.isOIV} onChange={(e) => setProfile({ ...profile, isOIV: e.target.checked })} />
              OIV
            </label>
            <label>
              <input type="checkbox" checked={profile.hasCriticalInfra} onChange={(e) => setProfile({ ...profile, hasCriticalInfra: e.target.checked })} />
              Infra critique
            </label>
          </div>

          <button type="submit" className="bg-blue-600 text-white p-2 rounded">Continuer</button>
        </form>
      )}

      {step === 'questions' && (
        <form onSubmit={handleSubmitQuestions(onSubmitAnswers)} className="space-y-6 mt-4">
          {questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded">
              <p className="font-semibold">{question.question}</p>
              <Controller
                control={control}
                name={`answers.${index}.answer`}
                render={({ field }) => {
                  switch (question.type) {
                    case 'boolean':
                      return (
                        <>
                          <label><input type="radio" value="oui" checked={field.value === 'oui'} onChange={field.onChange} /> Oui</label>
                          <label><input type="radio" value="non" checked={field.value === 'non'} onChange={field.onChange} /> Non</label>
                        </>
                      );
                    case 'scale':
                      return (
                        <select {...field} className="w-full border p-2 mt-1">
                          {[1, 2, 3, 4, 5].map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                      );
                    case 'choice':
                      return (
                        <select {...field} className="w-full border p-2 mt-1">
                          {question.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      );
                    case 'text':
                    default:
                      return <input type="text" {...field} className="w-full border p-2 mt-1" />;
                  }
                }}
              />
            </div>
          ))}

          <button type="submit" className="bg-green-600 text-white p-2 rounded" disabled={progress < totalQuestions}>Finaliser l&apos;audit</button>
        </form>
      )}
    </div>
  );
}

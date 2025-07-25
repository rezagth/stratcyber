'use client';
import React from 'react';
import { auditQuestions } from '../../lib/audit/questions';
import { AuditAnswer, AuditCategory } from '../../types/audit';
import { computeAuditResult } from '../../lib/audit/scoring';
import { z } from 'zod';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { saveAudit } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string().min(1, 'Réponse requise'),
      score: z.number().min(0).max(5).optional(),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

// Grouper les questions par catégorie
const questionsByCategory = auditQuestions.reduce((acc, question) => {
  if (!acc[question.category]) {
    acc[question.category] = [];
  }
  acc[question.category].push(question);
  return acc;
}, {} as Record<AuditCategory, typeof auditQuestions>);

export default function StrategiePage() {
  const router = useRouter();
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: auditQuestions.map(q => ({ questionId: q.id, answer: '', score: undefined })),
    },
    mode: 'onChange',
  });

  const categories = Object.keys(questionsByCategory) as AuditCategory[];

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const answers: AuditAnswer[] = data.answers.map((answer, idx) => ({
      questionId: answer.questionId,
      answer: answer.answer,
      score: answer.score ?? computeScore(auditQuestions[idx], answer.answer)
    }));
    const result = computeAuditResult(answers);
    
    try {
      await saveAudit(answers, result);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction pour calculer le score basé sur le type de question
  const computeScore = (question: typeof auditQuestions[number], answer: string): number => {
    if (question.type === 'scale') return Number(answer) || 0;
    if (question.type === 'boolean') return answer === 'oui' ? 5 : answer === 'non' ? 0 : 0;
    if (question.type === 'choice' && question.options) {
      const optionIndex = question.options.indexOf(answer);
      return optionIndex >= 0 ? Math.round((optionIndex / (question.options.length - 1)) * 5) : 0;
    }
    return answer.length > 0 ? 3 : 0; // Score par défaut pour les réponses texte
  };

  const currentAnswers = watch('answers') || [];
  const answersWithScores = currentAnswers.map((answer, idx) => ({
    ...answer,
    score: answer.score ?? computeScore(auditQuestions[idx], answer.answer)
  }));
  const currentResult = computeAuditResult(answersWithScores);
  const progress = (currentAnswers.filter(a => a.answer.length > 0).length / auditQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audit de Cybersécurité</h1>
          <p className="text-lg text-gray-600 mb-6">
            Évaluez la maturité cybersécurité de votre organisation
          </p>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {categories.map((category) => {
            const categoryQuestions = questionsByCategory[category];
            const categoryAnswers = currentAnswers.filter(a => 
              categoryQuestions.some(q => q.id === a.questionId)
            );
            const categoryScore = categoryAnswers.length > 0 
              ? Math.round((categoryAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / (categoryAnswers.length * 5)) * 100)
              : 0;
            
            return (
              <Card key={category} className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{category}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {categoryAnswers.length}/{categoryQuestions.length} réponses
                      </span>
                      {categoryAnswers.length === categoryQuestions.length && (
                        <Badge variant="secondary">{categoryScore}%</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {categoryQuestions.map((question, qIdx) => (
                      <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {qIdx + 1}. {question.question}
                            </h4>
                            {question.description && (
                              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <Controller
                          name={`answers.${auditQuestions.findIndex(q => q.id === question.id)}`}
                          control={control}
                          defaultValue={{ questionId: question.id, answer: '', score: undefined }}
                          render={({ field }) => (
                            <div className="space-y-2">
                              {question.type === 'scale' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-4">
                                    <input
                                      type="range"
                                      min="0"
                                      max="5"
                                      step="1"
                                      value={field.value?.answer || '0'}
                                      onChange={(e) => {
                                        field.onChange({
                                          questionId: question.id,
                                          answer: e.target.value,
                                          score: Number(e.target.value)
                                        });
                                      }}
                                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                                      {field.value?.answer || '0'} / 5
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Pas du tout</span>
                                    <span>Complètement</span>
                                  </div>
                                </div>
                              ) : question.type === 'boolean' ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value="oui"
                                      checked={field.value?.answer === 'oui'}
                                      onChange={(e) => {
                                        field.onChange({
                                          questionId: question.id,
                                          answer: e.target.value,
                                          score: 5
                                        });
                                      }}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Oui</span>
                                  </label>
                                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value="non"
                                      checked={field.value?.answer === 'non'}
                                      onChange={(e) => {
                                        field.onChange({
                                          questionId: question.id,
                                          answer: e.target.value,
                                          score: 0
                                        });
                                      }}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Non</span>
                                  </label>
                                </div>
                              ) : question.type === 'choice' && question.options ? (
                                <div className="grid grid-cols-1 gap-2">
                                  {question.options.map((option, optIdx) => (
                                    <label key={option} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={option}
                                        checked={field.value?.answer === option}
                                        onChange={(e) => {
                                          const score = Math.round((optIdx / (question.options!.length - 1)) * 5);
                                          field.onChange({
                                            questionId: question.id,
                                            answer: e.target.value,
                                            score: score
                                          });
                                        }}
                                        className="w-4 h-4 text-blue-600"
                                      />
                                      <span className="text-sm text-gray-700">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <textarea
                                  placeholder="Votre réponse..."
                                  value={field.value?.answer || ''}
                                  onChange={(e) => {
                                    field.onChange({
                                      questionId: question.id,
                                      answer: e.target.value,
                                      score: e.target.value.length > 0 ? 3 : 0
                                    });
                                  }}
                                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={3}
                                />
                              )}
                            </div>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {progress > 0 && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Aperçu des résultats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentResult.globalScore}%</div>
                    <div className="text-sm text-gray-600">Score global</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{currentResult.maturity}</div>
                    <div className="text-sm text-gray-600">Niveau de maturité</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{currentResult.recommendations.length}</div>
                    <div className="text-sm text-gray-600">Recommandations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              disabled={progress < 100}
            >
              Finaliser l&apos;audit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
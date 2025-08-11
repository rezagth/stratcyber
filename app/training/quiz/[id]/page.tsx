'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  passingScore: number;
  ebookId: string;
}

interface Ebook {
  id: string;
  title: string;
  author: string;
}

interface Props {
  params: { id: string };
}

export default function QuizPage({ params }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // D'abord récupérer l'ebook pour obtenir les infos du quiz
        const ebookResponse = await fetch(`/api/training/ebook/${params.id}`);
        if (!ebookResponse.ok) {
          throw new Error('Ebook non trouvé');
        }
        const ebookData = await ebookResponse.json();
        setEbook(ebookData);

        if (ebookData.quizzes && ebookData.quizzes.length > 0) {
          // Récupérer le premier quiz associé
          const quizResponse = await fetch(`/api/training/quiz/${ebookData.quizzes[0].id}`);
          if (!quizResponse.ok) {
            throw new Error('Quiz non trouvé');
          }
          const quizData = await quizResponse.json();
          setQuiz(quizData);
        } else {
          throw new Error('Aucun quiz disponible pour cet ebook');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params.id]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setShowExplanations(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz || !ebook) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Quiz non disponible</h1>
          <p className="text-gray-600 mb-8">{error || "Ce quiz n'est pas disponible."}</p>
          <Link
            href="/training"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour à la formation
          </Link>
        </div>
      </div>
    );
  }

  if (showResults) {
    const passed = score >= quiz.passingScore;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <Link
              href={`/training/ebook/${params.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour à l'ebook
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {passed ? (
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Félicitations !' : 'Résultat insuffisant'}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Votre score : <span className="font-bold text-2xl">{score}%</span>
            </p>
            
            <p className="text-gray-600 mb-8">
              Score requis pour valider : {quiz.passingScore}%
            </p>

            {passed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">
                  Excellent ! Vous avez validé ce quiz avec succès. 
                  Vous pouvez maintenant passer au prochain module ou recommencer si vous le souhaitez.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">
                  Vous n'avez pas atteint le score requis. 
                  Nous vous recommandons de relire l'ebook et de recommencer le quiz.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showExplanations ? 'Masquer' : 'Voir'} les explications
              </button>
              
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recommencer le quiz
              </button>
              
              <Link
                href={`/training/ebook/${params.id}`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Retour à l'ebook
              </Link>
            </div>

            {showExplanations && (
              <div className="mt-8 text-left">
                <h3 className="text-xl font-semibold mb-4">Explications des réponses</h3>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = selectedAnswers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <p className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </p>
                        
                        <div className="mb-2">
                          <span className={`inline-block px-2 py-1 rounded text-sm ${
                            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">
                          <strong>Votre réponse :</strong> {userAnswer || 'Aucune réponse'}
                        </p>
                        
                        {!isCorrect && (
                          <p className="text-gray-600 text-sm mb-2">
                            <strong>Bonne réponse :</strong> {question.correctAnswer}
                          </p>
                        )}
                        
                        <p className="text-gray-700 text-sm">
                          <strong>Explication :</strong> {question.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const allQuestionsAnswered = quiz.questions.every(q => selectedAnswers[q.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <Link
            href={`/training/ebook/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour à l'ebook
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* En-tête du quiz */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">Ebook : {ebook.title}</p>
          {quiz.description && (
            <p className="text-gray-700 mb-4">{quiz.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} sur {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-600">
              Score requis : {quiz.passingScore}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question actuelle */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{currentQ.question}</h2>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswers[currentQ.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={selectedAnswers[currentQ.id] === option}
                  onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
                  className="sr-only"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Précédent
            </button>

            <div className="flex gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : selectedAnswers[quiz.questions[index].id]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allQuestionsAnswered}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  allQuestionsAnswered
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Terminer le quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Suivant
              </button>
            )}
          </div>

          {!allQuestionsAnswered && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Répondez à toutes les questions pour pouvoir terminer le quiz
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

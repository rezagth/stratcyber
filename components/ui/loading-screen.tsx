'use client';

import { Loader2, Shield, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'auth' | 'redirect' | 'preload';
  showProgress?: boolean;
  progress?: number;
}

const variants = {
  default: {
    icon: Loader2,
    title: 'Chargement...',
    description: 'Veuillez patienter',
    bgClass: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    iconClass: 'text-blue-600',
    titleClass: 'text-gray-900',
    descriptionClass: 'text-gray-600'
  },
  auth: {
    icon: Shield,
    title: 'Vérification de votre session...',
    description: 'Authentification en cours',
    bgClass: 'bg-gradient-to-br from-green-50 to-emerald-100',
    iconClass: 'text-green-600',
    titleClass: 'text-gray-900',
    descriptionClass: 'text-gray-600'
  },
  redirect: {
    icon: CheckCircle,
    title: 'Redirection en cours...',
    description: 'Vous allez être redirigé vers votre tableau de bord',
    bgClass: 'bg-gradient-to-br from-purple-50 to-violet-100',
    iconClass: 'text-purple-600',
    titleClass: 'text-gray-900',
    descriptionClass: 'text-gray-600'
  },
  preload: {
    icon: Clock,
    title: 'Préparation de vos données...',
    description: 'Optimisation de votre expérience',
    bgClass: 'bg-gradient-to-br from-orange-50 to-amber-100',
    iconClass: 'text-orange-600',
    titleClass: 'text-gray-900',
    descriptionClass: 'text-gray-600'
  }
};

export function LoadingScreen({
  title,
  description,
  variant = 'default',
  showProgress = false,
  progress = 0
}: LoadingScreenProps) {
  const config = variants[variant];
  const Icon = config.icon;
  
  return (
    <div className={cn('flex flex-col min-h-screen', config.bgClass)}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          {/* Icon avec animation */}
          <div className="flex justify-center">
            <div className="relative">
              <Icon 
                className={cn(
                  'h-12 w-12',
                  config.iconClass,
                  variant === 'default' || variant === 'preload' ? 'animate-spin' : 'animate-pulse'
                )} 
              />
              {showProgress && (
                <div className="absolute inset-0 -m-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-gray-200"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className={config.iconClass}
                      strokeDasharray={`${(progress / 100) * 175.92} 175.92`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Textes */}
          <div className="space-y-2">
            <h2 className={cn('text-2xl font-semibold', config.titleClass)}>
              {title || config.title}
            </h2>
            <p className={cn('text-lg', config.descriptionClass)}>
              {description || config.description}
            </p>
            {showProgress && (
              <p className={cn('text-sm font-medium', config.iconClass)}>
                {progress}%
              </p>
            )}
          </div>
          
          {/* Points de chargement animés */}
          <div className="flex justify-center space-x-2">
            <div className={cn('w-2 h-2 rounded-full animate-bounce', config.iconClass)} />
            <div className={cn('w-2 h-2 rounded-full animate-bounce', config.iconClass)} style={{ animationDelay: '0.1s' }} />
            <div className={cn('w-2 h-2 rounded-full animate-bounce', config.iconClass)} style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

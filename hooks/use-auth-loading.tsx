'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseAuthLoadingOptions {
  redirectTo?: string;
  showToast?: boolean;
  preloadData?: () => Promise<void>;
}

export function useAuthLoading({
  redirectTo = '/dashboard',
  showToast = false,
  preloadData
}: UseAuthLoadingOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handleAuthenticated = async () => {
      if (status === 'authenticated' && !isRedirecting) {
        setIsRedirecting(true);
        
        if (showToast) {
          toast.success('Connexion réussie !', {
            description: 'Redirection vers votre tableau de bord...',
            duration: 2000,
          });
        }

        // Préchargement des données si fourni
        if (preloadData && !preloadComplete) {
          try {
            await preloadData();
            if (mounted) setPreloadComplete(true);
          } catch (error) {
            console.error('Erreur lors du préchargement:', error);
          }
        }

        // Petite pause pour une meilleure UX
        setTimeout(() => {
          if (mounted) {
            router.replace(redirectTo);
          }
        }, 1000);
      }
    };

    handleAuthenticated();

    return () => {
      mounted = false;
    };
  }, [status, router, redirectTo, showToast, preloadData, isRedirecting, preloadComplete]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    isRedirecting,
    preloadComplete
  };
}

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { toast } from 'sonner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Accès refusé', {
        description: 'Vous devez être connecté pour accéder à cette page',
      });
      router.replace('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <LoadingScreen 
        variant="auth" 
        title="Vérification de vos droits d'accès..."
        description="Authentification en cours"
      />
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return (
    <LoadingScreen 
      variant="redirect" 
      title="Redirection..."
      description="Vous allez être redirigé vers la page de connexion"
    />
  );
}

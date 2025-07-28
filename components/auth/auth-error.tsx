'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      let errorMessage = '';
      switch (error) {
        case 'CredentialsSignin':
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 'AccessDenied':
          errorMessage = 'Accès refusé';
          break;
        case 'EmailSignin':
          errorMessage = 'Erreur lors de l\'envoi de l\'email';
          break;
        default:
          errorMessage = 'Une erreur est survenue';
      }
      alert(errorMessage);
      router.replace('/auth/login');
    }
  }, [error, router]);

  return null;
}
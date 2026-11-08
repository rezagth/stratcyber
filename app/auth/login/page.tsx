'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Second facteur : affiché quand le serveur répond MFA_REQUIRED (mot de passe correct, MFA activée).
  const [needsTotp, setNeedsTotp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const totp = (formData.get('totp') as string | null) ?? '';

    // Toast de chargement
    const loadingToast = toast.loading('Connexion en cours...', {
      description: 'Vérification de vos identifiants',
    });

    try {
      const result = await signIn('credentials', {
        email,
        password,
        totp,
        redirect: false,
      });

      if (result?.error === 'MFA_REQUIRED') {
        toast.dismiss(loadingToast);
        setNeedsTotp(true);
        setError(null);
      } else if (result?.error) {
        // Dismiss loading toast et afficher erreur
        toast.dismiss(loadingToast);
        setError(result.error);
        toast.error('Échec de la connexion', {
          description: 'Vérifiez vos identifiants et réessayez',
          icon: <AlertCircle className="h-4 w-4" />,
        });
      } else {
        // Success toast
        toast.dismiss(loadingToast);
        toast.success('Connexion réussie !', {
          description: 'Redirection vers votre tableau de bord...',
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 2000,
        });
        
        // Aiguillage selon le rôle : un compte client va dans son espace, jamais dans le tableau de bord.
        const session = await getSession();
        const target = session?.user?.role === 'client' ? '/client' : '/dashboard';

        // Préchargement des données critiques (administrateur uniquement)
        try {
          if (target !== '/dashboard') throw new Error('skip');
          await Promise.all([
            fetch('/api/audits'),
            fetch('/api/roadmap/data')
          ]);
        } catch (preloadError) {
          console.log('Préchargement échoué, mais connexion réussie');
        }
        
        setTimeout(() => {
          router.push(target);
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      toast.error('Erreur de connexion', {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    'block w-full h-11 rounded-lg border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground shadow-xs transition focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-sidebar-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[oklch(0.5_0.2_290)]/25 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-[oklch(0.5_0.2_285)] shadow-lg">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">StratCyber</span>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Pilotez la cybersécurité de vos clients, sans friction.
          </h1>
          <p className="text-base text-sidebar-foreground/75">
            Audits, plans d&apos;action, dossiers de conformité et gestion de crise réunis dans un seul cockpit.
          </p>
        </div>
        <p className="relative text-xs text-sidebar-foreground/50">© InfraCyb</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <div className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Connexion</h2>
            <p className="text-sm text-muted-foreground">Accédez à votre espace sécurisé.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Adresse email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} placeholder="vous@entreprise.fr" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} placeholder="••••••••" />
            </div>

            {needsTotp && (
              <div className="space-y-1.5">
                <label htmlFor="totp" className="text-sm font-medium">
                  Code de l&apos;application d&apos;authentification (ou code de secours)
                </label>
                <input id="totp" name="totp" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus required className={inputCls} placeholder="123456" />
              </div>
            )}

            <Button type="submit" disabled={isLoading} size="lg" className="w-full h-11">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

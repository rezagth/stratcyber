import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Inscription publique fermée : les comptes sont créés par l'administrateur
 * (voir POST /api/auth/register, réservé au rôle admin).
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="max-w-md w-full space-y-6 p-8 bg-card rounded-lg shadow text-center">
        <h2 className="text-2xl font-extrabold text-foreground">Inscription sur invitation</h2>
        <p className="text-sm text-muted-foreground">
          Les comptes sont créés par votre conseiller InfraCyb. Si vous avez déjà un compte, connectez-vous.
        </p>
        <Button asChild>
          <Link href="/auth/login">Se connecter</Link>
        </Button>
      </div>
    </div>
  );
}

import { Geist } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
});
import './globals.css';
import AuthSessionProvider from '@/components/auth/session-provider';
import { IntegratedLayout } from '@/components/layout/integrated-layout';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'StratCyber',
  description: 'Plateforme d\'audit de cybersécurité',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={geist.className}>
      <body>
        <AuthSessionProvider>
          <IntegratedLayout>
            {children}
          </IntegratedLayout>
          <Toaster position="top-right" richColors closeButton />
        </AuthSessionProvider>
      </body>
    </html>
  );
}

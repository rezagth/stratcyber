import { Geist } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
});
import './globals.css';
import AuthSessionProvider from '@/components/auth/session-provider';
import { Nav } from '@/components/ui/nav';

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
          <Nav />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

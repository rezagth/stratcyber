'use client';

import Link from "next/link";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, BookOpen, CheckCircle, Award, Shield, Target, TrendingUp, Users, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  // Ancien comportement: si connecté, redirection immédiate et silencieuse vers /dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    // Optionnel: on peut retourner null pour éviter tout flash
    return null;
  }

  if (status === 'authenticated') {
    // Ne rien afficher pendant la redirection
    return null;
  }

  // Contenu de la landing page pour les utilisateurs non authentifiés
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Plateforme de Cybersécurité Professionnelle
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Sécurisez votre entreprise avec
                <span className="text-primary"> StratCyber</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Une plateforme complète d'audit de cybersécurité, de conformité réglementaire et de formation.
                Protégez votre organisation avec nos outils professionnels.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/auth/login">
                  Commencer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/register">
                  Créer un compte
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Fonctionnalités principales
            </h2>
            <p className="mt-4 text-muted-foreground md:text-xl">
              Tout ce dont vous avez besoin pour une cybersécurité optimale
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Audit de Sécurité</CardTitle>
                <CardDescription>
                  Évaluez votre posture de sécurité avec notre audit dynamique et intelligent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Questionnaires adaptatifs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Recommandations personnalisées
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Rapports détaillés
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileCheck className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Conformité Réglementaire</CardTitle>
                <CardDescription>
                  Respectez les normes RGPD, NIS2, DORA et autres réglementations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Suivi multi-réglementations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Alertes d'échéances
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Documentation automatique
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Tableau de Bord</CardTitle>
                <CardDescription>
                  Visualisez vos KPI sécurité et suivez vos progrès en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Métriques en temps réel
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Graphiques interactifs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Alertes personnalisées
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Formation</CardTitle>
                <CardDescription>
                  Formez vos équipes avec des contenus interactifs et certifiants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    E-books spécialisés
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Quiz interactifs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Parcours personnalisés
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Stratégie Sécurité</CardTitle>
                <CardDescription>
                  Développez votre roadmap sécurité avec notre assistant IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Plans d'action prioritaires
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Recommandations IA
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Suivi des objectifs
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Excellence</CardTitle>
                <CardDescription>
                  Une plateforme conçue par des experts pour les professionnels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Interface intuitive
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Support expert
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Mises à jour régulières
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col items-center space-y-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div className="text-4xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground text-center">
                Amélioration de la posture sécurité
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Users className="h-8 w-8 text-primary" />
              <div className="text-4xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground text-center">
                Entreprises accompagnées
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-8 w-8 text-primary" />
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground text-center">
                Monitoring sécurité
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Award className="h-8 w-8 text-primary" />
              <div className="text-4xl font-bold">ISO</div>
              <div className="text-sm text-muted-foreground text-center">
                Certifications supportées
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Prêt à sécuriser votre organisation ?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
              Rejoignez les centaines d'entreprises qui font confiance à StratCyber pour leur cybersécurité.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/register">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

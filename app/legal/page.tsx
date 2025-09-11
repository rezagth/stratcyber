"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Mentions Légales</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Informations légales concernant la plateforme StratCyber
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Éditeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📝</span>
              Éditeur de la plateforme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">InfraCyb</h3>
              <p className="text-muted-foreground">
                Société éditrice de la plateforme de cybersécurité StratCyber
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Développement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💻</span>
              Développement et conception
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">StratCyber</h3>
              <p className="text-muted-foreground">
                Plateforme développée et créée par StratCyber
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Contact :</strong> noam.chemoul@hotmail.com</p>
                <p><strong>Site web :</strong> StratCyber Platform</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Propriété intellectuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>©</span>
              Propriété intellectuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              La plateforme StratCyber, ses contenus, fonctionnalités et outils sont la propriété 
              intellectuelle d'InfraCyb et ont été développés par StratCyber.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation de tout ou 
              partie des éléments de la plateforme, quel que soit le moyen ou le procédé utilisé, 
              est interdite, sauf autorisation écrite préalable d'InfraCyb.
            </p>
          </CardContent>
        </Card>

        {/* Responsabilité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚖️</span>
              Responsabilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              InfraCyb s'efforce de fournir sur la plateforme StratCyber des informations 
              aussi précises que possible. Toutefois, elle ne pourra être tenue responsable 
              des omissions, des inexactitudes et des carences dans la mise à jour.
            </p>
            <p>
              Les informations fournies par la plateforme le sont à titre indicatif et ne 
              sauraient dispenser l'utilisateur d'une analyse adaptée à ses propres besoins.
            </p>
          </CardContent>
        </Card>

        {/* Protection des données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔒</span>
              Protection des données personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              InfraCyb s'engage à protéger la confidentialité et la sécurité des données 
              personnelles de ses utilisateurs conformément au Règlement Général sur la 
              Protection des Données (RGPD).
            </p>
            <p>
              Pour toute question relative à la protection de vos données personnelles, 
              vous pouvez contacter : <strong>noam.chemoul@hotmail.com</strong>
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📧</span>
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-4">
                Pour toute question concernant ces mentions légales ou l'utilisation 
                de la plateforme StratCyber :
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email :</strong> noam.chemoul@hotmail.com</p>
                <p><strong>Plateforme :</strong> StratCyber</p>
                <p><strong>Éditeur :</strong> InfraCyb</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

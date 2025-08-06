'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, FileText } from 'lucide-react';

export default function NIS2Documentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation NIS2</h1>
            <p className="text-lg text-gray-600">
              Directive sur la sécurité des réseaux et des systèmes d’information (NIS2)
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Shield className="h-5 w-5 mr-2" />
            Réglementation EU
          </Badge>
        </div>

        <div className="mt-6">
          <Accordion type="multiple" collapsible>
            <AccordionItem value="overview">
              <AccordionTrigger>Vue d'ensemble de NIS2</AccordionTrigger>
              <AccordionContent>
                <p>La directive NIS2 vise à renforcer la sécurité des réseaux et systèmes d'information au sein de l'UE.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <strong>Objectifs :</strong>
                  <ul className="list-disc list-inside">
                    <li>Améliorer la résilience des systèmes critiques</li>
                    <li>Mettre en place des mesures de gestion des risques</li>
                    <li>Renforcer la coopération entre États membres</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="requirements">
              <AccordionTrigger>Exigences de conformité</AccordionTrigger>
              <AccordionContent>
                <p>Les organisations doivent mettre en œuvre des mesures de sécurité adaptées à leur secteur et taille.</p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <strong>Exigences clés :</strong>
                  <ul className="list-disc list-inside">
                    <li>Évaluation continue des risques</li>
                    <li>Signalement des incidents dans les délais</li>
                    <li>Formation et sensibilisation des employés</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

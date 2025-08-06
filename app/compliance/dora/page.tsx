'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, FileText } from 'lucide-react';

export default function DORADocumentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation DORA</h1>
            <p className="text-lg text-gray-600">
              Digital Operational Resilience Act (DORA)
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
              <AccordionTrigger>Vue d'ensemble de DORA</AccordionTrigger>
              <AccordionContent>
                <p>La loi sur la résilience opérationnelle numérique vise à renforcer la cyber-résilience des institutions financières.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <strong>Objectifs :</strong>
                  <ul className="list-disc list-inside">
                    <li>Maintenir une résilience face aux cyber-incidents</li>
                    <li>Assurer la continuité des services financiers</li>
                    <li>Se conformer aux exigences réglementaires en matière de TIC</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="requirements">
              <AccordionTrigger>Exigences de conformité</AccordionTrigger>
              <AccordionContent>
                <p>Les institutions financières doivent établir des plans de résilience pour répondre aux cyber-incidents.</p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <strong>Exigences clés :</strong>
                  <ul className="list-disc list-inside">
                    <li>Établir un cadre de gestion des risques TIC</li>
                    <li>Effectuer des tests réguliers de résilience</li>
                    <li>Mettre en place des accords avec les fournisseurs de TIC</li>
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

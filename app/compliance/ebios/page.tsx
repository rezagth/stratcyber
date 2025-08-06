'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, FileText } from 'lucide-react';

export default function EBIOSDocumentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation EBIOS</h1>
            <p className="text-lg text-gray-600">
              Expression des Besoins et Identification des Objectifs de Sécurité (EBIOS)
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Shield className="h-5 w-5 mr-2" />
            Méthodologie de Risque
          </Badge>
        </div>

        <div className="mt-6">
          <Accordion type="multiple" collapsible>
            <AccordionItem value="overview">
              <AccordionTrigger>Vue d'ensemble de EBIOS</AccordionTrigger>
              <AccordionContent>
                <p>EBIOS est une méthode pour évaluer et gérer les risques liés à la cybersécurité.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <strong>Objectifs :</strong>
                  <ul className="list-disc list-inside">
                    <li>Identifier les risques</li>
                    <li>Analyser les impacts</li>
                    <li>Gérer les risques de manière proactive</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process">
              <AccordionTrigger>Processus EBIOS</AccordionTrigger>
              <AccordionContent>
                <p>Le processus EBIOS est structuré en plusieurs étapes pour une gestion efficace des risques.</p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <strong>Étapes clés :</strong>
                  <ul className="list-decimal list-inside">
                    <li>Contexte et périmètre</li>
                    <li>Étude des événements redoutés</li>
                    <li>Analyse des risques</li>
                    <li>Stratégie de traitement</li>
                    <li>Suivi des risques</li>
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

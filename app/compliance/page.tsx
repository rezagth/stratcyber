'use client';

import React from 'react';
import Link from 'next/link';

const DocumentationPlatform = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Plateforme de Documentation de Conformité</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/compliance/rgpd" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">RGPD</h2>
          <p>Documentation complète du Règlement Général sur la Protection des Données.</p>
        </Link>
        <Link href="/compliance/nis2" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">NIS2</h2>
          <p>Exigences et mesures sous la directive NIS2.</p>
        </Link>
        <Link href="/compliance/dora" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">DORA</h2>
          <p>Directives et plans d'action pour la résilience opérationnelle numérique (DORA).</p>
        </Link>
        <Link href="/compliance/ebios" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">EBIOS</h2>
          <p>Méthodologie d'évaluation des risques avec l'EBIOS.</p>
        </Link>
        <Link href="/compliance/roadmap" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Feuille de Route</h2>
          <p>Planifiez vos prochaines étapes en matière de conformité.</p>
        </Link>
        <Link href="/compliance/action-plan" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Plan d'action</h2>
          <p>Gestion des plans d'action pour les conformités et la sécurité.</p>
        </Link>
      </div>
    </div>
  );
};

export default DocumentationPlatform;

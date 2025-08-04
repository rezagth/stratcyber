'use client';

import React from 'react';
import ImprovedAuditForm from '@/components/audit/ImprovedAuditForm';

export default function StrategiePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audit de Cybersécurité</h1>
          <p className="text-lg text-gray-600 mb-6">
            Évaluez la maturité cybersécurité de votre organisation
          </p>
        </div>
        
        <ImprovedAuditForm />
      </div>
    </div>
  );
}
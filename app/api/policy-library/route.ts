import { NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/auth/api-auth';
import { documentVariables, POLICY_LIBRARY } from '@/lib/policy/library';
import { VARIABLES } from '@/lib/policy/library-variables';

/**
 * Bibliothèque intégrée de l'assistant de dossier de conformité : documents (sans leur texte, inutile
 * côté écran) et questions associées. Administrateur uniquement, comme le catalogue de modèles.
 */
export const GET = withApiAuth(
  async () => {
    const documents = POLICY_LIBRARY.map((doc) => ({
      id: doc.id,
      type: doc.type,
      name: doc.name,
      description: doc.description,
      variables: documentVariables(doc).filter((key) => key in VARIABLES),
    }));
    const used = new Set(documents.flatMap((d) => d.variables));
    const variables = Object.fromEntries(Object.entries(VARIABLES).filter(([key]) => used.has(key)));
    return NextResponse.json({ documents, variables });
  },
  { roles: ['admin'] }
);

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { actionId, documents, content } = body;

    if (!actionId || !documents || !content) {
      return NextResponse.json(
        { error: 'Paramètres manquants' }, 
        { status: 400 }
      );
    }

    // Créer un nouveau ZIP
    const zip = new JSZip();

    // Ajouter le document principal
    if (content.mainDocument) {
      zip.file('procedure_principale.md', content.mainDocument);
    }

    // Ajouter la checklist si elle existe
    if (content.checklist) {
      const checklistContent = content.checklist.map((item: any, index: number) => 
        `${index + 1}. ${item.task} ${item.completed ? '✅' : '⬜'}`
      ).join('\n');
      
      zip.file('checklist.txt', checklistContent);
    }

    // Ajouter le template email si il existe
    if (content.emailTemplate) {
      zip.file('template_email.txt', content.emailTemplate);
    }

    // Ajouter un fichier README avec les informations
    const readmeContent = `# Documents générés - ${actionId}

## Documents inclus:
${documents.map((doc: string) => `- ${doc}`).join('\n')}

## Date de génération:
${new Date().toLocaleString('fr-FR')}

## Instructions:
1. Consultez le document principal pour les procédures détaillées
2. Utilisez la checklist pour suivre l'avancement
3. Adaptez le template email selon vos besoins

---
Généré par StratCyber - Automatisation des processus de cybersécurité
`;

    zip.file('README.md', readmeContent);

    // Générer le ZIP
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    // Retourner le fichier ZIP
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="documents_${actionId}_${Date.now()}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur génération ZIP:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du ZIP' }, 
      { status: 500 }
    );
  }
}

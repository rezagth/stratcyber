import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/db';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const audit = await prisma.audit.findUnique({
    where: { id: params.id },
    include: { responses: true },
  });
  if (!audit) return new NextResponse('Audit introuvable', { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Rapport d\'audit cybersécurité', { x: 50, y: 800, size: 20, font, color: rgb(0.1,0.2,0.5) });
  page.drawText(`Date : ${new Date(audit.createdAt).toLocaleDateString()}`, { x: 50, y: 770, size: 12, font });
  page.drawText(`Score global : ${audit.score}/100`, { x: 50, y: 750, size: 12, font });
  page.drawText(`Maturité : ${audit.maturity}`, { x: 50, y: 730, size: 12, font });

  page.drawText('Recommandations :', { x: 50, y: 700, size: 14, font });
  page.drawText(audit.recommendations || '', { x: 50, y: 680, size: 10, font, maxWidth: 500 });

  page.drawText('Réponses :', { x: 50, y: 650, size: 14, font });
  let y = 630;
  for (const r of audit.responses) {
    page.drawText(`- ${r.question}: ${r.answer} (score ${r.score})`, { x: 60, y, size: 10, font });
    y -= 16;
    if (y < 60) break;
  }

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="audit-${audit.id}.pdf"`,
    },
  });
} 
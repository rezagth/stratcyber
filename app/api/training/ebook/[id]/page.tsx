import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const ebook = await prisma.ebook.findUnique({
      where: { id },
    });

    if (!ebook) {
      return NextResponse.json({ message: 'Ebook non trouvé' }, { status: 404 });
    }

    return NextResponse.json(ebook, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur serveur', error }, { status: 500 });
  }
}

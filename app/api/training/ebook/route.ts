import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const ebooks = await prisma.ebook.findMany();
    return NextResponse.json(ebooks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching ebooks', error }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, author, content, url } = body;

    const newEbook = await prisma.ebook.create({
      data: { title, author, content, url },
    });

    return NextResponse.json(newEbook, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating ebook', error }, { status: 400 });
  }
}

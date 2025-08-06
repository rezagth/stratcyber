import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Ebook {
  id: string;
  title: string;
  author: string;
  content?: string; // HTML string expected
  url: string;      // PDF url or external link
  createdAt: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EbookPage({ params }: Props) {
  const { id } = await params;

  const ebook = await prisma.ebook.findUnique({ where: { id } });

  if (!ebook) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600 font-semibold">
        Ebook introuvable
      </div>
    );
  }

  const isPdf = ebook.url.toLowerCase().endsWith('.pdf');

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">{ebook.title}</h1>
      <p className="text-gray-600 mb-8">Par {ebook.author}</p>

      {ebook.content ? (
        <article
          className="prose max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: ebook.content }}
        />
      ) : isPdf ? (
        <div className="mb-8 border rounded shadow-lg overflow-hidden">
          <iframe
            src={ebook.url}
            title="Visualisation Ebook PDF"
            width="100%"
            height="700px"
            className="block"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      ) : (
        <p className="mb-8 text-gray-500 text-lg">Pas de contenu disponible pour cet ebook.</p>
      )}

      <a
        href={ebook.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
      >
        Télécharger l’ebook
      </a>
    </div>
  );
}

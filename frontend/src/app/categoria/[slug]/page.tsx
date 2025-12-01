// src/app/categoria/[slug]/page.tsx
import Header from '@/components/shop/Header/Header';
import ProductsGrid from '@/components/store/ProductsGrid';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const categoriaMap: Record<string, string> = {
  mulher: 'Mulher',
  homem: 'Homem',
  crianca: 'Criança',
  casa: 'Casa',
  eletronica: 'Eletrônica',
  'livros-e-multimedia': 'Livros e Multimédia',
  'hobbies-e-colecoes': 'Hobbies e Coleções',
  desporto: 'Desporto',
} as const;

// Tipagem correta para Next.js 15+
type PageProps = {
  params: Promise<{ slug: string }>;
};

// generateMetadata – já estava quase perfeito
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const nome =
    categoriaMap[slug] ||
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return {
    title: `${nome} - Kitroca`,
    description: `Os melhores artigos em segunda mão na categoria ${nome} em Angola.`,
    openGraph: {
      title: `${nome} - Kitroca`,
      description: `Explora milhares de artigos usados e novos na categoria ${nome}.`,
      url: '/categoria/' + slug,
    },
  };
}

// Página principal
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Validação + 404 para slugs desconhecidos
  if (!(slug in categoriaMap)) {
    notFound();
  }

  const nomeCategoria = categoriaMap[slug];

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8 min-h-screen bg-gray-50">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          {nomeCategoria}
        </h1>

        {/* Passa a categoria em minúsculas (o filtro do ProductsGrid espera assim) */}
        <ProductsGrid category={slug} limit={60} />
      </main>
    </>
  );
}
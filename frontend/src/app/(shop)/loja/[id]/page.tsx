// src/app/shop/loja/[id]/page.tsx
import StoreProfile from "@/components/store/StoreProfile";
import ProductsGrid, { type Product as GridProduct } from "@/components/store/ProductsGrid";
import { notFound } from "next/navigation";
import { getLojaById } from "@/lib/queries/loja.api";
import { getProductByLoja } from "@/lib/queries/products.api";
import type { Product } from "@/types/product";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LojaPage({ params }: PageProps) {
  const { id } = await params;

  let loja = null;
  let produtosApi: Product[] = [];

  try {
    [loja, produtosApi] = await Promise.all([
      getLojaById(id),
      getProductByLoja(id),
    ]);

    if (!loja) notFound();
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erro ao carregar loja
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Mapeamento PERFEITO do seu Product (PT) → GridProduct (EN)
  const produtosParaGrid: GridProduct[] = produtosApi.map((p) => ({
    id: p.id,
    title: p.titulo,
    price: p.preco,
    condition: p.condicao,
    likes: p.likes ?? 0,
    image: p.imagens.find(img => img.isPrincipal)?.url 
           || p.imagens[0]?.url 
           || `https://picsum.photos/seed/prod-${p.id}/400/500`,
    isLiked: false,
    category: p.categoriaId, // ou você pode mapear nome da categoria depois se quiser
  }));

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StoreProfile loja={loja} totalItems={produtosApi.length} />

        <div className="mt-10 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Artigos à venda ({produtosApi.length})
          </h2>
          <p className="text-gray-600 mt-1">
            {produtosApi.length === 0
              ? "Esta loja ainda não tem artigos publicados."
              : `Explora todos os ${produtosApi.length} artigos disponíveis`}
          </p>
        </div>

        <ProductsGrid produtos={produtosParaGrid} limit={40} />
      </div>
    </div>
  );
}
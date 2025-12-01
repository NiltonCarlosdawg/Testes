// src/components/store/ProductsGrid.tsx
'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Package } from 'lucide-react';

// Tipo público – pode ser usado em qualquer lugar do projeto
export interface Product {
  id: number | string;
  title: string;
  price: number;
  condition: string;
  likes: number;
  image: string;
  isLiked?: boolean;
  category?: string;
}

// Props do componente – todas opcionais com valores padrão sensatos
interface ProductsGridProps {
  produtos?: Product[];
  limit?: number;
  category?: string;
  searchQuery?: string;
}

// Mock de fallback (só usado quando não houver produtos reais)
const mockProducts: Product[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: i % 9 === 0 ? 'iPhone 15 Pro Max 512GB' : `Artigo #${i + 1}`,
  price: Math.floor(Math.random() * 900000) + 40000,
  condition: ['Novo sem etiquetas', 'Muito bom', 'Bom', 'Satisfatório'][
    Math.floor(Math.random() * 4)
  ],
  likes: Math.floor(Math.random() * 400),
  image: `https://picsum.photos/seed/kitroca${i + 1}/400/500`,
  isLiked: false,
  category: ['moda', 'eletronica', 'casa', 'desporto'][
    Math.floor(Math.random() * 4)
  ],
}));

// Formatação em Kwanzas (Angola)
const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(amount);

export default function ProductsGrid({
  produtos,
  limit = 30,
  category,
  searchQuery = '',
}: ProductsGridProps) {
  // Usa produtos reais ou mock
  const baseProducts = produtos && produtos.length > 0 ? produtos : mockProducts;

  const filteredProducts = useMemo(() => {
    let list = baseProducts;

    if (category) {
      list = list.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(query));
    }

    return list.slice(0, limit);
  }, [baseProducts, category, searchQuery, limit]);

  if (filteredProducts.length === 0) {
    return (
      <div className="col-span-full py-16 text-center">
        <p className="text-lg font-medium text-gray-600">
          Nenhum artigo encontrado
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Tente ajustar os filtros ou volte mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {filteredProducts.map((product) => (
        <Link
          key={product.id}
          href={`/produto/${product.id}`}
          className="group relative block overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
        >
          {/* Imagem com Next/Image para performance e SEO */}
          <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-t-xl">
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={Number(product.id) <= 6}
            />

            {/* Badge NOVO */}
            {product.condition === 'Novo sem etiquetas' && (
              <span className="absolute top-2 left-2 z-10 rounded-md bg-black px-2.5 py-1 text-xs font-bold text-white">
                NOVO
              </span>
            )}

            {/* Ícone de pacote */}
            {Number(product.id) % 8 === 0 && (
              <div className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm">
                <Package className="h-4 w-4 text-gray-700" />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-3 space-y-2">
            <h3 className="line-clamp-2 text-sm font-medium leading-tight text-gray-900">
              {product.title}
            </h3>

            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
              <Heart className="h-5 w-5 text-gray-400 transition-colors group-hover:text-red-500" />
            </div>

            <p className="truncate text-xs text-gray-500">
              {product.condition}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
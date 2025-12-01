// app/(shop)/minha-conta/wishlist/page.tsx

'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// Função local (ou importa do utils)
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart className="h-20 w-20 mx-auto text-gray-300 mb-4" />
        <p className="text-xl text-muted-foreground">A tua lista de favoritos está vazia</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-primary" />
        <h1 className="text-2xl lg:text-3xl font-bold">Favoritos ({items.length})</h1>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 flex items-center gap-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-2xl font-bold text-primary">{formatPrice(item.price)}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/produto/${item.slug}`}>Ver produto</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
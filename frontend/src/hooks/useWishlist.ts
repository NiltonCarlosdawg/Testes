'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
};

type WishlistStore = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);
          if (exists) {
            toast.info('Já tens este item nos favoritos');
            return state;
          }
          toast.success('Adicionado aos favoritos');
          return { items: [...state.items, item] };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          if (newItems.length === state.items.length) return state; // não encontrou
          toast.success('Removido dos favoritos');
          return { items: newItems };
        });
      },

      isInWishlist: (id) => get().items.some((i) => i.id === id),

      clearWishlist: () => {
        set({ items: [] });
        toast.success('Lista de favoritos limpa');
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
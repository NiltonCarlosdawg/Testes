import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { TCarrinhoItemWithProductResponse } from '@/types/carrinho.types';

type CartItem = TCarrinhoItemWithProductResponse;

type CartStore = {
  items: CartItem[];
  isSyncing: boolean;
  lastSync: Date | null;

  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantidade: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;

  syncWithServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;

  subtotal: number;
  totalItems: number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      lastSync: null,

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantidade: i.quantidade + item.quantidade }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQuantity: (id, quantidade) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantidade } : i
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      syncWithServer: async () => {
        const { items, isSyncing } = get();
        if (isSyncing || items.length === 0) return;

        set({ isSyncing: true });
        try {
          await Promise.all(
            items.map(async (item) => {
              const payload = {
                produtoId: item.produtoId,
                variacaoId: item.variacaoId || undefined,
                quantidade: item.quantidade,
              };

              if (item.id.startsWith('local-')) {
                const res = await api.post('/carrinho', payload);
                const newId = res.data.data.id;
                set((state) => ({
                  items: state.items.map((i) =>
                    i.id === item.id ? { ...i, id: newId } : i
                  ),
                }));
              } else {
                await api.put(`/carrinho/${item.id}`, { quantidade: item.quantidade });
              }
            })
          );
          set({ lastSync: new Date() });
          toast.success('Carrinho sincronizado!');
        } catch (error) {
          toast.error('Erro ao sincronizar carrinho');
        } finally {
          set({ isSyncing: false });
        }
      },

      loadFromServer: async () => {
        try {
          const res = await api.get('/carrinho/user');
          const serverItems: CartItem[] = res.data.data;

          set({
            items: serverItems.map((item) => ({
              ...item,
              id: item.id, 
            })),
            lastSync: new Date(),
          });
        } catch (error) {
          toast.error('Erro ao carregar carrinho');
        }
      },

      get subtotal() {
        return get().items.reduce((acc, item) => {
          const price =
            item.variacao?.preco ??
            item.produto?.precoPromocional ??
            item.produto?.preco ??
            0;
          return acc + price * item.quantidade;
        }, 0);
      },

      get totalItems() {
        return get().items.reduce((acc, item) => acc + item.quantidade, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items.map((i) => ({
          ...i,
          id: i.id.startsWith('local-') ? i.id : undefined, 
        })),
      }),
    }
  )
);
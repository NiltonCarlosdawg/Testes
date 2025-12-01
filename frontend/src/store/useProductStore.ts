import { create } from 'zustand';

interface QuickViewState {
  productId: string | null;
  setProductId: (id: string | null) => void;
}

export const useQuickViewStore = create<QuickViewState>((set) => ({
  productId: null,
  setProductId: (id) => set({ productId: id }),
}));
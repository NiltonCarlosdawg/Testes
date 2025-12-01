import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import { toast } from 'sonner';
import {
  CarrinhoItem,
  CreateCarrinhoItemInput,
  UpdateCarrinhoItemInput,
  ApiResponse,
  TCarrinhoItemWithProductResponse,
} from '@/types/carrinho.types';
import { useCartStore } from '@/store/useCartStore';

export const useSyncCart = () => {
  const sync = useCartStore((s) => s.syncWithServer);
  const isSyncing = useCartStore((s) => s.isSyncing);

  return { sync, isSyncing };
};

export const useGetCarrinhoByUserLoad = () => {
  useCartStore((s) => s.loadFromServer);
  const items = useCartStore((s) => s.items);

  // Carrega do servidor na montagem
  // useEffect(() => { load(); }, [load]);

  return {
    data: { data: items },
    isLoading: false,
  };
};



export const useGetCarrinhoByUser = () => {
  return useQuery<ApiResponse<TCarrinhoItemWithProductResponse[]>>({
    queryKey: ['carrinho'],
    queryFn: async () => {
      const res = await api.get('/carrinho/user');
      return res.data;
    }
  });
};


export const useAddCarrinhoItem = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ id: string }>, Error, CreateCarrinhoItemInput>({
    mutationFn: async (data) => {
      const res = await api.post('/carrinho', data);
      return res.data;
    },
    onSuccess: (res) => {
      toast(res.message || 'Item adicionado ao carrinho!');
      queryClient.invalidateQueries({ queryKey: ['carrinho'] });
    },
    onError: () => toast('Erro ao adicionar item no carrinho'),
  });
};

export const useUpdateCarrinhoItem = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<CarrinhoItem>, Error, { id: string; data: UpdateCarrinhoItemInput }>({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/carrinho/${id}`, data);
      return res.data;
    },
    onSuccess: (res) => {
      toast(res.message || 'Item atualizado!');
      queryClient.invalidateQueries({ queryKey: ['carrinho'] });
    },
    onError: () => toast('Falha ao atualizar item'),
  });
};

export const useDeleteCarrinhoItem = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/carrinho/${id}`);
    },
    onSuccess: () => {
      toast('Item removido do carrinho');
      queryClient.invalidateQueries({ queryKey: ['carrinho'] });
    },
    onError: () => toast('Erro ao remover item'),
  });
};

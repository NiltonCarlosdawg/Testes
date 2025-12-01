import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import { toast } from 'sonner';
import { Product, ProductApiResponse } from '@/types/product';

interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string[];
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  conditions?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  inStock?: boolean;
}

interface Category {
  id: string;
  nome: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export const useGetCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categorias'); 
      return response.data.data; 
    },
  });
};

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export const useGetProducts = ({
  page = 1,
  limit = 10,
  search = '',
  categories = [],
  brands = [],
  colors = [],
  sizes = [],
  conditions = [],
  priceMin,
  priceMax,
  sortBy,
  inStock,
}: FilterParams) => {
  return useQuery<ProductApiResponse>({
    queryKey: ['products', { page, limit, search, categories, brands, colors, sizes, conditions, priceMin, priceMax, sortBy, inStock }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (categories.length) params.append('categories', categories.join(','));
      if (brands.length) params.append('brands', brands.join(','));
      if (colors.length) params.append('colors', colors.join(','));
      if (sizes.length) params.append('sizes', sizes.join(','));
      if (conditions.length) params.append('conditions', conditions.join(','));
      if (priceMin !== undefined) params.append('priceMin', priceMin.toString());
      if (priceMax !== undefined) params.append('priceMax', priceMax.toString());
      if (sortBy) params.append('sortBy', sortBy);
      if (inStock !== undefined) params.append('inStock', inStock.toString());

      const response = await api.get('/produtos', { params });
      return response.data;
    },
  });
};

export const useGetFilterOptions = () => {
  return useQuery<{
    categories: { id: string; nome: string }[];
    brands: string[];
    colors: string[];
    sizes: string[];
    conditions: string[];
    priceRange: { min: number; max: number };
  }>({
    queryKey: ['filterOptions'],
    queryFn: async () => {
      const response = await api.get('/produtos/filters');
      return response.data.data;
    },
  });
};

export const useGetProductByLoja = (id?: string) => {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['productsByLoja', id],
    queryFn: async () => {
      const response = await api.get(`/produtos/loja/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}


export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<string>, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await api.post('/produtos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast(data.message || 'Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Ocorreu um erro ao criar o produto.');
    },
  });
};

export const useGetProductById = (id?: string) => {
  return useQuery<ApiResponse<Product>>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/produtos/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const getProductReviews = async () => {
  return [
    { id: '1', rating: 5, comment: 'Ótimo produto!', author: 'João' },
    { id: '2', rating: 4, comment: 'Gostei bastante.', author: 'Maria' },
  ];
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Product>, Error, { id: string; values: Partial<Product> }>({
    mutationFn: async ({ id, values }) => {
      const response = await api.put(`/produtos/${id}`, values);
      return response.data;
    },
    onSuccess: (data) => {
      toast(data.message || 'Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Erro ao atualizar produto.');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async (id) => {
      const response = await api.delete(`/produtos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast('Produto removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Erro ao remover produto.');
    },
  });
};
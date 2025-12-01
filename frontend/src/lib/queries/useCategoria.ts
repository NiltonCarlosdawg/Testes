import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../axios'
import { toast } from 'sonner'

export interface Categoria {
  id: string
  nome: string
  descricao?: string
}

export const useGetCategories = (page = 1, limit = 10, search = '') =>
  useQuery({
    queryKey: ['categories', { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (search) params.append('search', search)

      const { data } = await api.get('/categorias', { params })
      return data
    }
  })

export const useGetCategoryById = (id: string) =>
  useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data } = await api.get(`/categorias/${id}`)
      return data.data
    },
    enabled: !!id
  })

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<Categoria>) => {
      const { data } = await api.post('/categorias', body)
      return data
    },
    onSuccess: (data) => {
      toast(data.message)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<Categoria> }) => {
      const { data } = await api.put(`/categorias/${id}`, body)
      return data
    },
    onSuccess: (data) => {
      toast(data.message)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categorias/${id}`)
    },
    onSuccess: () => {
      toast('Categoria removida!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

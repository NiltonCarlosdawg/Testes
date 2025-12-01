import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../axios'
import { toast } from 'sonner'

export interface Loja {
  id: string
  nome: string
  donoId: string
}

export const useGetLojas = (page = 1, limit = 10, search = '') =>
  useQuery({
    queryKey: ['lojas', { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (search) params.append('search', search)

      const { data } = await api.get('/lojas', { params })
      return data
    }
  })

export const useGetLojaById = (id: string) =>
  useQuery({
    queryKey: ['loja', id],
    queryFn: async () => {
      const { data } = await api.get(`/lojas/${id}`)
      return data.data
    },
    enabled: !!id
  })

export const useGetLojasByDono = (donoId: string) =>
  useQuery({
    queryKey: ['lojas-dono', donoId],
    queryFn: async () => {
      const { data } = await api.get(`/lojas/dono/${donoId}`)
      return data.data
    },
    enabled: !!donoId
  })

export const useCreateLoja = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<Loja>) => {
      const { data } = await api.post('/lojas', body)
      return data
    },
    onSuccess: (data) => {
      toast(data.message)
      qc.invalidateQueries({ queryKey: ['lojas'] })
    }
  })
}

export const useUpdateLoja = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<Loja> }) => {
      const { data } = await api.put(`/lojas/${id}`, body)
      return data
    },
    onSuccess: (data) => {
      toast(data.message)
      qc.invalidateQueries({ queryKey: ['lojas'] })
    }
  })
}

export const useDeleteLoja = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/lojas/${id}`)
    },
    onSuccess: () => {
      toast('Loja removida!')
      qc.invalidateQueries({ queryKey: ['lojas'] })
    }
  })
}

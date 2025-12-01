import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../axios'
import { toast } from 'sonner'

export enum StatusPagamento {
  PENDENTE = "pendente",
  PAGO = "pago",
  FALHOU = "falhou",
  REEMBOLSADO = "reembolsado",
}

export enum StatusPedido {
  PENDENTE = "pendente",
  CONFIRMADO = "confirmado",
  EM_PREPARACAO = "em_preparacao",
  ENVIADO = "enviado",
  ENTREGUE = "entregue",
  CANCELADO = "cancelado",
}

export type TEnderecoEntrega = {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

export type TPedido = {
  id: string;
  numeroPedido: string;
  compradorId: string;
  lojaId: string;
  subtotal: number;
  valorFrete: number;
  desconto: number;
  total: number;
  metodoPagamentoId: string | null;
  statusPagamento: StatusPagamento;
  referenciaPagamento: string | null;
  status: StatusPedido;
  enderecoEntrega: TEnderecoEntrega;
  codigoRastreio: string | null;
  transportadora: string | null;
  previsaoEntrega: Date | null;
  observacoesComprador: string | null;
  observacoesVendedor: string | null;
  motivoCancelamento: string | null;
  confirmadoEm: Date | null;
  pagoEm: Date | null;
  enviadoEm: Date | null;
  entregueEm: Date | null;
  canceladoEm: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const useGetPedidos = (page = 1, limit = 10, search = '') =>
  useQuery({
    queryKey: ['pedidos', { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (search) params.append('search', search)

      const { data } = await api.get('/pedidos', { params })
      return data
    }
  })

export const useGetPedidoById = (id: string) =>
  useQuery({
    queryKey: ['pedido', id],
    queryFn: async () => {
      const { data } = await api.get(`/pedidos/${id}`)
      return data.data
    },
    enabled: !!id
  })

export const useGetPedidosByComprador = (compradorId: string) =>
  useQuery({
    queryKey: ['pedidos-comprador', compradorId],
    queryFn: async () => {
      const { data } = await api.get(`/pedidos/comprador/${compradorId}`)
      return data.data
    },
    enabled: !!compradorId
  })

export const useGetPedidosByLoja = (lojaId: string) =>
  useQuery({
    queryKey: ['pedidos-loja', lojaId],
    queryFn: async () => {
      const { data } = await api.get(`/pedidos/loja/${lojaId}`)
      return data.data
    },
    enabled: !!lojaId
  })

export const useCreatePedido = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<TPedido>) => {
      const { data } = await api.post('/pedidos', body)
      return data
    },
    onSuccess: (d) => {
      toast(d.message)
      qc.invalidateQueries({ queryKey: ['pedidos'] })
    }
  })
}

export const useUpdatePedido = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<TPedido> }) => {
      const { data } = await api.put(`/pedidos/${id}`, body)
      return data
    },
    onSuccess: (d) => {
      toast(d.message)
      qc.invalidateQueries({ queryKey: ['pedidos'] })
    }
  })
}

export const useDeletePedido = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pedidos/${id}`)
    },
    onSuccess: () => {
      toast('Pedido removido!')
      qc.invalidateQueries({ queryKey: ['pedidos'] })
    }
  })
}

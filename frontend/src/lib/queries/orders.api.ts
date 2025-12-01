import {
  TCreatePedidoInput,
  TUpdatePedidoInput,
  TUpdatePedidoStatusInput,
} from '@/schema/order.schema'
import api from '../axios'
import {
  TPedidoResponse,
  TDashboardStats,
  TMonthlyRevenue,
  TTopProduto,
} from '@/types/pedidos.types'

export type TPedido = TPedidoResponse

export interface PaginacaoResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    total: number
  }
}

export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

/**
 * Criar um novo pedido
 */
export const createPedido = async (
  pedido: TCreatePedidoInput,
): Promise<ApiResponse<{ id: string }>> => {
  const { data } = await api.post('/pedidos', pedido)
  return data
}

/**
 * Buscar todos os pedidos com paginação e busca
 */
export const getPedidos = async (
  page = 1,
  limit = 10,
  search = '',
): Promise<PaginacaoResponse<TPedido>> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  if (search) params.append('search', search)

  const { data } = await api.get('/pedidos', { params })
  return data
}

/**
 * Buscar pedido por ID
 */
export const getPedidoById = async (id: string): Promise<ApiResponse<TPedido>> => {
  const { data } = await api.get(`/pedidos/${id}`)
  return data
}

/**
 * Buscar pedidos por comprador
 */
export const getPedidosByComprador = async (
  compradorId: string,
): Promise<ApiResponse<TPedido[]>> => {
  const { data } = await api.get(`/pedidos/comprador/${compradorId}`)
  return data
}

/**
 * Buscar pedidos por loja (com paginação)
 */
export const getPedidosByLoja = async (
  lojaId: string,
  page = 1,
  limit = 10,
  search = '',
): Promise<PaginacaoResponse<TPedido>> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  if (search) params.append('search', search)

  const { data } = await api.get(`/pedidos/loja/${lojaId}`, { params })
  return data
}

/**
 * Atualizar pedido
 */
export const updatePedido = async (
  id: string,
  body: TUpdatePedidoInput,
): Promise<ApiResponse<TPedido>> => {
  const { data } = await api.put(`/pedidos/${id}`, body)
  return data
}

/**
 * Atualizar status do pedido
 */
export const updatePedidoStatus = async (
  id: string,
  body: TUpdatePedidoStatusInput,
): Promise<ApiResponse<TPedido>> => {
  const { data } = await api.patch(`/pedidos/${id}/status`, body)
  return data
}

/**
 * Cancelar pedido
 */
export const cancelPedido = async (
  id: string,
  motivo: string,
): Promise<ApiResponse<TPedido>> => {
  const { data } = await api.post(`/pedidos/${id}/cancel`, { motivo })
  return data
}

/**
 * Excluir (cancelar logicamente) pedido
 */
export const deletePedido = async (id: string): Promise<void> => {
  await api.delete(`/pedidos/${id}`)
}

/**
 * Pedidos do dia
 */
export const getPedidosHoje = async (
  lojaId: string,
  page = 1,
  limit = 10,
): Promise<PaginacaoResponse<TPedido>> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const { data } = await api.get(`/pedidos/hoje/${lojaId}`, { params })
  return data
}

/**
 * Pedidos pendentes de envio
 */
export const getPedidosPendentesEnvio = async (
  lojaId: string,
  page = 1,
  limit = 10,
): Promise<PaginacaoResponse<TPedido>> => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())

  const { data } = await api.get(`/pedidos/pendentes-envio/${lojaId}`, {
    params,
  })
  return data
}

/**
 * Dashboard da loja
 */
export const getDashboard = async (
  lojaId: string,
): Promise<ApiResponse<TDashboardStats>> => {
  const { data } = await api.get(`/pedidos/dashboard/${lojaId}`)
  return data
}

/**
 * Faturamento mensal
 */
export const getFaturamentoMes = async (
  lojaId: string,
): Promise<ApiResponse<TMonthlyRevenue[]>> => {
  const { data } = await api.get(`/pedidos/faturamento-mes/${lojaId}`)
  return data
}

/**
 * Top produtos
 */
export const getTopProdutos = async (
  lojaId: string,
): Promise<ApiResponse<TTopProduto[]>> => {
  const { data } = await api.get(`/pedidos/top-produtos/${lojaId}`)
  return data
}
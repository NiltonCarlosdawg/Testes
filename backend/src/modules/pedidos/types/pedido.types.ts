import { TransactionManager } from "@/utils/create-transaction.js";
import { TCreatePedidoInput, TUpdatePedidoInput } from "../schemas/pedido.schema.js";
import { TQueryRequest } from "@/types/query.types.js";

export enum StatusPagamento {
  PENDENTE = "pendente",
  PAGO = "pago",
  FALHADO = "falhado",
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
  pais: string;
};

export type TPedidoItemDbRow = {
  id: string;
  pedido_id: string;
  produto_id: string;
  variacao_id?: string;
  titulo: string;
  preco: string; 
  quantidade: number;
  subtotal: string; 
  imagem_url?: string;
  created_at: Date;
};

export type TPedidoItemResponse = {
  id: string;
  pedidoId: string;
  produtoId: string;
  variacaoId?: string;
  titulo: string;
  preco: number;
  quantidade: number;
  subtotal: number;
  imagemUrl?: string;
  createdAt: Date;
};

export type TPedidoDbRow = {
  id: string;
  numero_pedido: string;
  comprador_id: string;
  loja_id: string;
  subtotal: string;
  valor_frete: string;
  desconto: string;
  total: string;
  metodo_pagamento_id?: string;
  status_pagamento: StatusPagamento;
  referencia_pagamento?: string;
  status: StatusPedido;
  endereco_entrega: TEnderecoEntrega | string;
  codigo_rastreio?: string;
  transportadora?: string;
  previsao_entrega?: Date;
  observacoes_comprador?: string;
  observacoes_vendedor?: string;
  motivo_cancelamento?: string;
  confirmado_em?: Date;
  pago_em?: Date;
  enviado_em?: Date;
  entregue_em?: Date;
  cancelado_em?: Date;
  created_at: Date;
  updated_at: Date;
};

export type TPedidoResponse = {
  id: string;
  numeroPedido: string;
  compradorId: string;
  lojaId: string;
  subtotal: number;
  valorFrete: number;
  desconto: number;
  total: number;
  metodoPagamentoId?: string;
  statusPagamento: StatusPagamento;
  referenciaPagamento?: string;
  status: StatusPedido;
  enderecoEntrega: TEnderecoEntrega;
  codigoRastreio?: string;
  transportadora?: string;
  previsaoEntrega?: Date;
  observacoesComprador?: string;
  observacoesVendedor?: string;
  motivoCancelamento?: string;
  confirmadoEm?: Date;
  pagoEm?: Date;
  enviadoEm?: Date;
  entregueEm?: Date;
  canceladoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
  itens?: TPedidoItemResponse[];
};

export type TDashboardStats = {
  faturamentoTotal: number;
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosPagos: number;
  pedidosEnviados: number;
};

export type TMonthlyRevenue = {
  mes: string; 
  faturamento: number;
};

export type TTopProduto = {
  produto_id: string;
  titulo: string;
  total_vendido: number;
};

export interface IPedidoRepository {
  create(data: TCreatePedidoInput, numeroPedido: string, tx?: TransactionManager): Promise<string>;
  findById(id: string): Promise<TPedidoResponse | null>;
  findItensByPedidoId(pedidoId: string): Promise<TPedidoItemResponse[]>;
  findByCompradorId(compradorId: string): Promise<TPedidoResponse[]>;
  findByLojaId(lojaId: string, params: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }>;
  getAll(params: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }>;
  update(params: { id: string; data: TUpdatePedidoInput }): Promise<TPedidoResponse>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: StatusPedido, statusPagamento?: StatusPagamento, extraData?: Record<string, any>): Promise<TPedidoResponse>;
  findForToday(lojaId: string, params: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }>;
  findPendingShipment(lojaId: string, params: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }>;
  getDashboardStats(lojaId: string): Promise<TDashboardStats>;
  getMonthlyRevenue(lojaId: string): Promise<TMonthlyRevenue[]>;
  getTopSellingProducts(lojaId: string, limit: number): Promise<TTopProduto[]>;
}


export interface IFAResponseService<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export interface InsertResult {
  id: string;
}

export interface CountResult {
  total: string;
}
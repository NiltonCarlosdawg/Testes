// src/lib/types.ts

export enum StatusLoja {
  APROVADO = "aprovado",
  PENDENTE = "pendente",
  ATIVA = "ativa",
  SUSPENSA = "suspensa",
  INATIVA = "inativa",
}

export type TEnderecoComercial = {
  rua: string;
  numero?: string | undefined;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string | undefined;
};

export type TLojaResponse = {
  id: string;
  donoId: string;
  nome: string;
  descricao?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: StatusLoja;
  documentoIdentificacao?: string;
  emailComercial?: string;
  telefoneComercial?: string;
  enderecoComercial?: TEnderecoComercial;
  aprovadoPor?: string;
  aprovadoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
};

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

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}
import {
  TPedidoDbRow,
  TPedidoResponse,
  TEnderecoEntrega,
  StatusPedido,
  StatusPagamento,
  TPedidoItemDbRow,
  TPedidoItemResponse,
} from "../types/pedido.types.js";

/**
 * Modelo para PedidoItem
 */
export class PedidoItem {
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

  constructor(data: TPedidoItemDbRow) {
    this.id = data.id;
    this.pedidoId = data.pedido_id;
    this.produtoId = data.produto_id;
    this.variacaoId = data.variacao_id;
    this.titulo = data.titulo;
    this.preco = parseFloat(data.preco); // Converte string 'numeric' para number
    this.quantidade = data.quantidade;
    this.subtotal = parseFloat(data.subtotal); // Converte string 'numeric' para number
    this.imagemUrl = data.imagem_url;
    this.createdAt = new Date(data.created_at);
  }

  toJSON(): TPedidoItemResponse {
    return {
      id: this.id,
      pedidoId: this.pedidoId,
      produtoId: this.produtoId,
      variacaoId: this.variacaoId,
      titulo: this.titulo,
      preco: this.preco,
      quantidade: this.quantidade,
      subtotal: this.subtotal,
      imagemUrl: this.imagemUrl,
      createdAt: this.createdAt,
    };
  }
}

/**
 * Modelo para Pedido
 */
export class Pedido {
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

  constructor(data: TPedidoDbRow) {
    this.id = data.id;
    this.numeroPedido = data.numero_pedido;
    this.compradorId = data.comprador_id;
    this.lojaId = data.loja_id;
    this.subtotal = parseFloat(data.subtotal);
    this.valorFrete = parseFloat(data.valor_frete);
    this.desconto = parseFloat(data.desconto);
    this.total = parseFloat(data.total);
    this.metodoPagamentoId = data.metodo_pagamento_id;
    this.statusPagamento = data.status_pagamento;
    this.referenciaPagamento = data.referencia_pagamento;
    this.status = data.status;
    this.enderecoEntrega = this.parseEndereco(data.endereco_entrega);
    this.codigoRastreio = data.codigo_rastreio;
    this.transportadora = data.transportadora;
    this.previsaoEntrega = data.previsao_entrega ? new Date(data.previsao_entrega) : undefined;
    this.observacoesComprador = data.observacoes_comprador;
    this.observacoesVendedor = data.observacoes_vendedor;
    this.motivoCancelamento = data.motivo_cancelamento;
    this.confirmadoEm = data.confirmado_em ? new Date(data.confirmado_em) : undefined;
    this.pagoEm = data.pago_em ? new Date(data.pago_em) : undefined;
    this.enviadoEm = data.enviado_em ? new Date(data.enviado_em) : undefined;
    this.entregueEm = data.entregue_em ? new Date(data.entregue_em) : undefined;
    this.canceladoEm = data.cancelado_em ? new Date(data.cancelado_em) : undefined;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  private parseEndereco(endereco: TEnderecoEntrega | string | undefined): TEnderecoEntrega {
    if (typeof endereco === "string") {
      try {
        return JSON.parse(endereco) as TEnderecoEntrega;
      } catch (error) {
        console.error("Erro ao fazer parse do endereco_entrega:", error);
        // Retorna um objeto padrão ou lança um erro, dependendo da regra de negócio
        throw new Error("Formato de endereço inválido no banco de dados.");
      }
    }
    // Se já for objeto (ex: vindo de um RETURNING * após JSON.stringify)
    if (typeof endereco === "object" && endereco !== null) {
        return endereco;
    }
    throw new Error("Endereço de entrega ausente ou inválido.");
  }

  toJSON(): Omit<TPedidoResponse, 'itens'> { // Omit 'itens' as it's handled by the repository
    return {
      id: this.id,
      numeroPedido: this.numeroPedido,
      compradorId: this.compradorId,
      lojaId: this.lojaId,
      subtotal: this.subtotal,
      valorFrete: this.valorFrete,
      desconto: this.desconto,
      total: this.total,
      metodoPagamentoId: this.metodoPagamentoId,
      statusPagamento: this.statusPagamento,
      referenciaPagamento: this.referenciaPagamento,
      status: this.status,
      enderecoEntrega: this.enderecoEntrega,
      codigoRastreio: this.codigoRastreio,
      transportadora: this.transportadora,
      previsaoEntrega: this.previsaoEntrega,
      observacoesComprador: this.observacoesComprador,
      observacoesVendedor: this.observacoesVendedor,
      motivoCancelamento: this.motivoCancelamento,
      confirmadoEm: this.confirmadoEm,
      pagoEm: this.pagoEm,
      enviadoEm: this.enviadoEm,
      entregueEm: this.entregueEm,
      canceladoEm: this.canceladoEm,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
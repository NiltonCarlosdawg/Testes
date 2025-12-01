import { formatZodError } from "@/utils/formatZodError.js";
import {
  TCreatePedidoInput,
  TUpdatePedidoInput,
  createPedidoSchema,
  updatePedidoSchema,
  TUpdatePedidoStatusInput,
  updatePedidoStatusSchema
} from "../schemas/pedido.schema.js";
import { ConflictException, NotFoundException, ValidationException } from "@/utils/domain.js";
import {
  TPedidoResponse,
  IFAResponseService,
  TDashboardStats,
  TMonthlyRevenue,
  TTopProduto,
  StatusPedido,
  StatusPagamento
} from "../types/pedido.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import LojaRepository from "@/modules/lojas/repositories/loja.repository.js";
import { TransactionManager } from "@/utils/create-transaction.js";
import { ProdutoRepository } from "@/modules/produtos/repositories/produto.repository.js";
import { TQueryRequest } from "@/types/query.types.js";
import { PedidoRepository } from "../repositories/pedido.repository.js";

import { NotificacaoService, TipoNotificacao, PRIORIDADE_NOTIFICACAO } from "@/modules/notifications/types/notification.types.js";
import { QueueService } from "@/config/queue.js";
import { ActivityType, EntityType } from "@/modules/activity-log/types/activity-log.types.js";
import { logger } from "@/utils/logger.js";

const COMPONENT = "PedidoService";

export class PedidoService {
  private repository: PedidoRepository;
  private userRepository: UserRepository;
  private lojaRepository: LojaRepository;
  private produtoRepository: ProdutoRepository;
  private notificacaoService: NotificacaoService;
  private queueService: typeof QueueService;

  constructor(
    repository: PedidoRepository,
    userRepository: UserRepository,
    lojaRepository: LojaRepository,
    produtoRepository: ProdutoRepository,
    notificacaoService: NotificacaoService,
    queueService: typeof QueueService
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.lojaRepository = lojaRepository;
    this.produtoRepository = produtoRepository;
    this.notificacaoService = notificacaoService;
    this.queueService = queueService;
  }

  async create(data: TCreatePedidoInput): Promise<string> {
    const validation = createPedidoSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }

    const comprador = await this.userRepository.findById(
      validation.data.compradorId
    );
    if (!comprador) {
      throw new NotFoundException(
        'Comprador (usuário) não encontrado',
        COMPONENT
      );
    }

    const loja = await this.lojaRepository.findById(
      validation.data.lojaId
    );
    if (!loja) {
      throw new NotFoundException('Loja não encontrada', COMPONENT);
    }

    const numeroPedido = await this.generateNumeroPedido(loja.nome);
    
    const transaction = new TransactionManager();

    const pedidoId = await transaction.execute(async (tx) => {
      const produtosParaAtualizar: Array<{
        id: string;
        novaQuantidade: number;
      }> = [];

      for (const item of validation.data.itens) {
        const produto = await this.produtoRepository.findByIdForUpdate(
          item.produtoId,
          tx 
        );

        if (!produto) {
          throw new NotFoundException(
            `Produto ${item.produtoId} não encontrado`,
            COMPONENT
          );
        }

        const novaQuantidade = produto.quantidadeEstoque - item.quantidade;

        if (novaQuantidade < 0) {
          throw new ConflictException(
            `Estoque insuficiente para o produto ${produto.titulo}. ` +
              `Quantidade disponível: ${produto.quantidadeEstoque}`,
            COMPONENT
          );
        }

        produtosParaAtualizar.push({
          id: item.produtoId,
          novaQuantidade,
        });
      }
      const id = await this.repository.create(
        validation.data,
        numeroPedido,
        tx 
      );
      for (const produto of produtosParaAtualizar) {
        await this.produtoRepository.updateQuantity(
          produto.id,
          produto.novaQuantidade,
          tx 
        );
      }
      return id;
    });

    await this.queueService.publish("activity_log", "log_event", {
      userId: comprador.id,
      activityType: ActivityType.ORDER_CREATED,
      entityType: EntityType.ORDER,
      entityId: pedidoId,
      description: `Novo pedido #${numeroPedido} criado por ${comprador.email}.`,
      metadata: {
        lojaId: loja.id,
        valorTotal: validation.data.total,
        itens: validation.data.itens.length
      }
    });

    await this.notificacaoService.create({
      userId: comprador.id,
      titulo: "Pedido Recebido!",
      mensagem: `Seu pedido #${numeroPedido} na loja "${loja.nome}" foi recebido e está aguardando confirmação.`,
      tipo: TipoNotificacao.PEDIDO_NOVO,
      prioridade: PRIORIDADE_NOTIFICACAO.MEDIA,
      link: `/meus-pedidos/${pedidoId}`
    });

    await this.notificacaoService.create({
      userId: loja.donoId,
      titulo: "Você tem um novo pedido!",
      mensagem: `Novo pedido #${numeroPedido} de ${comprador.primeiroNome} (${comprador.email}). Valor: R$ ${validation.data.total}`,
      tipo: TipoNotificacao.PEDIDO_NOVO,
      prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
      enviarEmail: true,
      link: `/minha-loja/pedidos/${pedidoId}`
    });

    return pedidoId;
  }
  
  async generateNumeroPedido(loja: string): Promise<string> {
    const ultimoPedido = await this.repository.findLastOrder(); 
    const ano = new Date().getFullYear(); 

    let nextNumber = 1; 

    if (!ultimoPedido) {
      return `${loja}/${ano}/${nextNumber}`;
    }
    const partes = ultimoPedido?.numeroPedido.split("/"); 
    const ultimoNumero = parseInt(partes[2] || "0", 10);
    nextNumber = ultimoNumero + 1;

    const numeroPedido = `${loja}/${ano}/${nextNumber}`;
    return numeroPedido;
  }
  
  async findById(id: string): Promise<TPedidoResponse> {
    await IdMandatory(id);
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException("Pedido não encontrado", COMPONENT);
    }
    return item;
  }

  async findByCompradorId(compradorId: string): Promise<TPedidoResponse[]> {
    await IdMandatory(compradorId);
    return await this.repository.findByCompradorId(compradorId);
  }
  
  async findByLojaId(lojaId: string, query: TQueryRequest): Promise<IFAResponseService<TPedidoResponse>> {
    await IdMandatory(lojaId);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    
    validatePaginationParams(page, limit);
    
    const { data, total } = await this.repository.findByLojaId(lojaId, { page, limit });
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  async getAll(query: TQueryRequest): Promise<IFAResponseService<TPedidoResponse>> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const search = query.search;

    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.getAll({ page, limit, search });
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  async update(id: string, data: TUpdatePedidoInput, actorId: string): Promise<TPedidoResponse> {
    await IdMandatory(id);

    const validation = updatePedidoSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }

    const pedidoAntes = await this.findById(id);

    const pedidoDepois = await this.repository.update({ id, data });

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.ORDER_UPDATED,
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Pedido #${pedidoAntes.numeroPedido} foi atualizado.`,
      metadata: {
        changes: data
      }
    });

    return pedidoDepois;
  }

  async delete(id: string, actorId: string): Promise<void> {
    const pedido = await this.findById(id); 
    const loja = await this.lojaRepository.findById(pedido.lojaId);
    
    if (!loja) {
        logger.warn(`[${COMPONENT}] Loja ${pedido.lojaId} não encontrada para notificar sobre deleção do pedido ${id}`);
    }

    await this.repository.delete(id); 

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.ORDER_CANCELLED,
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Pedido #${pedido.numeroPedido} (ID: ${id}) foi DELETADO.`,
      metadata: {
        numeroPedido: pedido.numeroPedido,
        lojaId: pedido.lojaId,
        compradorId: pedido.compradorId
      }
    });
    
    await this.notificacaoService.create({
      userId: pedido.compradorId,
      titulo: "Seu pedido foi removido",
      mensagem: `O pedido #${pedido.numeroPedido} foi removido do sistema.`,
      tipo: TipoNotificacao.PEDIDO_CANCELADO,
      prioridade: PRIORIDADE_NOTIFICACAO.CRITICA,
      enviarEmail: true
    });
    
    if(loja) {
        await this.notificacaoService.create({
          userId: loja.donoId,
          titulo: "Pedido Removido",
          mensagem: `O pedido #${pedido.numeroPedido} (ID: ${id}) foi removido do sistema por um administrador.`,
          tipo: TipoNotificacao.PEDIDO_CANCELADO,
          prioridade: PRIORIDADE_NOTIFICACAO.ALTA
        });
    }
  }

  async updateStatus(id: string, data: TUpdatePedidoStatusInput, actorId: string): Promise<TPedidoResponse> {
    await IdMandatory(id);
    
    const validation = updatePedidoStatusSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }
    
    const pedido = await this.findById(id);
    
    if(pedido.status === StatusPedido.CANCELADO && pedido.statusPagamento === StatusPagamento.PAGO){
      throw new ConflictException("não pode Pagar um pedido Cancelado")
    }

    if (pedido.status === StatusPedido.ENTREGUE && data.status !== StatusPedido.ENTREGUE) {
      throw new ConflictException("Pedido já foi entregue e não pode ser alterado.", COMPONENT);
    }

    if (pedido.statusPagamento === StatusPagamento.PAGO && data.statusPagamento === StatusPagamento.PAGO) {
      throw new ConflictException("Pedido já está pago.", COMPONENT);
    }
    const extraData: Record<string, string> = {};
    if (data.motivoCancelamento) extraData.motivoCancelamento = data.motivoCancelamento;
    if (data.codigoRastreio) extraData.codigoRastreio = data.codigoRastreio;
    if (data.transportadora) extraData.transportadora = data.transportadora;


    const pedidoAtualizado = await this.repository.updateStatus(id, data.status, data.statusPagamento, extraData);

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.ORDER_UPDATED,
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Status do pedido #${pedido.numeroPedido} alterado para: ${data.status} / ${data.statusPagamento || 'N/A'}.`,
      metadata: {
        status_anterior: pedido.status,
        status_novo: data.status,
        pagamento_anterior: pedido.statusPagamento,
        pagamento_novo: data.statusPagamento
      }
    });

    await this.notificacaoService.create({
      userId: pedido.compradorId,
      titulo: "Atualização no seu pedido",
      mensagem: `O status do seu pedido #${pedido.numeroPedido} foi atualizado. Novo status: ${data.status}.`,
      tipo: TipoNotificacao.SISTEMA,
      prioridade: PRIORIDADE_NOTIFICACAO.MEDIA,
      link: `/meus-pedidos/${id}`
    });
    
    return pedidoAtualizado;
  }
  
  async cancel(id: string, motivo: string, actorId: string): Promise<TPedidoResponse> {
    await IdMandatory(id);
    if (!motivo) {
        throw new ValidationException("Motivo do cancelamento é obrigatório", COMPONENT);
    }
    
    const pedido = await this.findById(id); 
    const loja = await this.lojaRepository.findById(pedido.lojaId);

    const extraData = { motivoCancelamento: motivo };
    const pedidoCancelado = await this.repository.updateStatus(id, StatusPedido.CANCELADO, undefined, extraData);
    
    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.ORDER_CANCELLED,
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Pedido #${pedido.numeroPedido} CANCELADO. Motivo: ${motivo}`,
      metadata: { motivo }
    });

    await this.notificacaoService.create({
      userId: pedido.compradorId,
      titulo: "Seu pedido foi cancelado",
      mensagem: `O pedido #${pedido.numeroPedido} foi cancelado. Motivo: ${motivo}`,
      tipo: TipoNotificacao.PEDIDO_CANCELADO,
      prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
      enviarEmail: true,
      link: `/meus-pedidos/${id}`
    });

    if (loja) {
        await this.notificacaoService.create({
          userId: loja.donoId,
          titulo: "Pedido Cancelado",
          mensagem: `O pedido #${pedido.numeroPedido} foi cancelado. Motivo: ${motivo}`,
          tipo: TipoNotificacao.PEDIDO_CANCELADO,
          prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
          link: `/minha-loja/pedidos/${id}`
        });
    }
    
    return pedidoCancelado;
  }
  
  async markAsPaid(id: string, referenciaPagamento: string, actorId: string): Promise<TPedidoResponse> {
    await IdMandatory(id);
    await this.findById(id);
    
    const pedido = await this.findById(id);
    const loja = await this.lojaRepository.findById(pedido.lojaId);
    
    const extraData = { referenciaPagamento: referenciaPagamento };
    const pedidoPago = await this.repository.updateStatus(id, StatusPedido.CONFIRMADO, StatusPagamento.PAGO, extraData);

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.PAYMENT_SUCCESS,
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Pagamento do pedido #${pedido.numeroPedido} confirmado. Ref: ${referenciaPagamento}`,
      metadata: { referenciaPagamento }
    });
    
    await this.notificacaoService.create({
      userId: pedido.compradorId,
      titulo: "Pagamento Aprovado!",
      mensagem: `O pagamento do seu pedido #${pedido.numeroPedido} foi aprovado! Estamos preparando para o envio.`,
      tipo: TipoNotificacao.PEDIDO_PAGO,
      prioridade: PRIORIDADE_NOTIFICACAO.MEDIA,
      link: `/meus-pedidos/${id}`
    });

    if (loja) {
        await this.notificacaoService.create({
          userId: loja.donoId,
          titulo: "Pagamento Confirmado!",
          mensagem: `O pagamento do pedido #${pedido.numeroPedido} foi confirmado. Prepare o envio.`,
          tipo: TipoNotificacao.PEDIDO_PAGO,
          prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
          enviarEmail: true,
          link: `/minha-loja/pedidos/${id}`
        });
    }
    
    return pedidoPago;
  }

  async markAsShipped(id: string, codigoRastreio: string, transportadora: string, actorId: string): Promise<TPedidoResponse> {
    await IdMandatory(id);
    const pedido = await this.findById(id);
    
    const extraData = { codigoRastreio: codigoRastreio, transportadora: transportadora };
    const pedidoEnviado = await this.repository.updateStatus(id, StatusPedido.ENVIADO, undefined, extraData);

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId, 
      activityType: ActivityType.ORDER_UPDATED, 
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Pedido #${pedido.numeroPedido} enviado. Rastreio: ${transportadora} ${codigoRastreio}`,
      metadata: { transportadora, codigoRastreio }
    });
    
    await this.notificacaoService.create({
      userId: pedido.compradorId,
      titulo: "Seu pedido foi enviado!",
      mensagem: `Boas notícias! O pedido #${pedido.numeroPedido} foi enviado via ${transportadora}. Cód. Rastreio: ${codigoRastreio}`,
      tipo: TipoNotificacao.PEDIDO_ENVIADO,
      prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
      enviarEmail: true,
      link: `/meus-pedidos/${id}`
    });
    
    return pedidoEnviado;
  }
  
  async markAsDelivered(id: string, actorId: string): Promise<TPedidoResponse> {
    await IdMandatory(id);
    const pedido = await this.findById(id);
    
    const pedidoEntregue = await this.repository.updateStatus(id, StatusPedido.ENTREGUE);

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.ORDER_COMPLETED,
      entityType: EntityType.ORDER,
      entityId: id,
      description: `Pedido #${pedido.numeroPedido} marcado como ENTREGUE.`
    });
    
    await this.notificacaoService.create({
      userId: pedido.compradorId,
      titulo: "Pedido Entregue!",
      mensagem: `Seu pedido #${pedido.numeroPedido} foi entregue. Esperamos que goste!`,
      tipo: TipoNotificacao.PEDIDO_ENTREGUE,
      prioridade: PRIORIDADE_NOTIFICACAO.MEDIA,
      link: `/meus-pedidos/${id}/avaliar`
    });
    
    return pedidoEntregue;
  }

  async getHoje(lojaId: string, query: TQueryRequest): Promise<IFAResponseService<TPedidoResponse>> {
    await IdMandatory(lojaId);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.findForToday(lojaId, { page, limit });
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }
  
  async getPendentesEnvio(lojaId: string, query: TQueryRequest): Promise<IFAResponseService<TPedidoResponse>> {
    await IdMandatory(lojaId);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.findPendingShipment(lojaId, { page, limit });
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      }
    };
  }

  async getDashboard(lojaId: string): Promise<TDashboardStats> {
    await IdMandatory(lojaId);
    return await this.repository.getDashboardStats(lojaId);
  }

  async getFaturamentoMes(lojaId: string): Promise<TMonthlyRevenue[]> {
    await IdMandatory(lojaId);
    return await this.repository.getMonthlyRevenue(lojaId);
  }

  async getTopProdutos(lojaId: string): Promise<TTopProduto[]> {
    await IdMandatory(lojaId);
    return await this.repository.getTopSellingProducts(lojaId, 10);
  }
}
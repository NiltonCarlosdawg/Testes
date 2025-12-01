import { ProdutoRepository, TFilterParams } from "../repositories/produto.repository.js";
import { TQueryRequest, IFAResponseService } from "@/types/query.types.js";
import { TProdutoResponse } from "../types/produto.types.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { NOTFOUND } from "@/utils/CONSTANTS.js";
import { NotFoundException, ValidationException, ConflictException } from "@/utils/domain.js";
import { createProdutoSchema, updateProdutoSchema, TCreateProdutoInput, TUpdateProdutoInput } from "../schemas/produto.schema.js";
import { formatZodError } from "@/utils/formatZodError.js";
import { ActivityType, EntityType } from "@/modules/activity-log/types/activity-log.types.js";
import { LojaRepository } from "@/modules/lojas/repositories/loja.repository.js";
import { TipoNotificacao, PRIORIDADE_NOTIFICACAO, NotificacaoService } from "@/modules/notifications/types/notification.types.js";
import { logger } from "@/utils/logger.js";
import { QueueService } from "@/config/queue.js";

export class ProdutoService {
  constructor(
    private repository: ProdutoRepository,
    private lojaRepository: LojaRepository,
    private notificacaoService: NotificacaoService,
    private queueService: typeof QueueService
  ) {}
  async create(data: TCreateProdutoInput, actorId: string): Promise<string> {
    const parsed = createProdutoSchema.safeParse(data);
    if (!parsed.success) {
      const errorMessage = formatZodError(parsed.error);
      throw new ValidationException(errorMessage);
    }

    try {
      const result = await this.repository.create(parsed.data);

      this.queueService.publish("activity_log", "produto_created", {
        userId: actorId,
        activityType: ActivityType.PRODUCT_CREATED,
        entityType: EntityType.PRODUCT, 
        entityId: result,
        description: `Produto criado: ${data.titulo} (SKU: ${data.sku})`,
        metadata: {
            lojaId: data.lojaId,
            preco: data.preco,
            quantidade: data.quantidadeEstoque
        }
      });

      return result;
    } catch (error) {
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : null;
      if (errorCode === '23505') {
        throw new ConflictException("Um produto com dados semelhantes (ex: SKU) já existe.");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<TProdutoResponse> {
    await IdMandatory(id);
    const produto = await this.repository.findById(id);
    if (!produto) throw new NotFoundException(NOTFOUND("Produto"));
    return produto;
  }

  async findByLoja(id: string): Promise<TProdutoResponse[]> {
    await IdMandatory(id);
    const produto = await this.repository.findByLoja(id);
    if (!produto) throw new NotFoundException(NOTFOUND("Produto"));
    return produto;
  }

  async getAll({
    page,
    limit,
    search,
    filters,
  }: TQueryRequest & { filters?: TFilterParams }): Promise<IFAResponseService<TProdutoResponse>> {
    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.getAll({ page, limit, search, filters });
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async getFilterOptions() {
    return await this.repository.getFilterOptions();
  }

  async updateQuantity(id: string, quantidade: number, actorId: string): Promise<void>{
    await this.findById(id); 
    await this.repository.updateQuantity(id, quantidade);

    this.queueService.publish("activity_log", "produto_stock_updated", {
        userId: actorId,
        activityType: ActivityType.PRODUCT_UPDATED,
        entityType: EntityType.PRODUCT,
        entityId: id,
        description: `Estoque do produto ${id} atualizado para ${quantidade}.`,
        metadata: { novaQuantidade: quantidade }
    });
  }

  async update(id: string, data: TUpdateProdutoInput, actorId: string): Promise<TProdutoResponse> {
    const parsed = updateProdutoSchema.safeParse(data);
    if (!parsed.success) {
      const errorMessage = formatZodError(parsed.error);
      throw new ValidationException(errorMessage);
    }

    const produtoAntes = await this.findById(id);
    const updated = await this.repository.update(id, parsed.data);

    this.queueService.publish("activity_log", "produto_updated", {
        userId: actorId,
        activityType: ActivityType.PRODUCT_UPDATED,
        entityType: EntityType.PRODUCT,
        entityId: id,
        description: `Produto ${updated.titulo} atualizado.`,
        metadata: {
            camposAtualizados: Object.keys(parsed.data)
        }
    });

    try {
      const loja = await this.lojaRepository.findById(produtoAntes.lojaId);
      if (!loja) {
          logger.warn(`[ProdutoService] Loja ${produtoAntes.lojaId} não encontrada para notificação de update.`);
          return updated;
      }

      const foiDesativado = produtoAntes.ativo && data.ativo === false;
      const acaoDeAdmin = loja.donoId !== actorId;

      if (foiDesativado && acaoDeAdmin) {
        await this.notificacaoService.create({
              userId: loja.donoId,
              titulo: "Seu produto foi desativado",
              mensagem: `Seu produto "${produtoAntes.titulo}" foi desativado por um administrador, possivelmente por violar os termos.`,
              tipo: TipoNotificacao.ALERTA,
              prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
              link: `/minha-loja/produtos/editar/${id}`
        });
      }
    } catch (error) {
        logger.error(`[ProdutoService] Falha ao enviar notificação de update para produto ${id}`, error);
    }
    return updated;
  }

  async delete(id: string, actorId: string): Promise<boolean> {
    const produto = await this.findById(id);
    const result = await this.repository.delete(id);

    if (result) {
        this.queueService.publish("activity_log", "produto_deleted", {
            userId: actorId,
            activityType: ActivityType.PRODUCT_DELETED,
            entityType: EntityType.PRODUCT,
            entityId: id,
            description: `Produto ${produto.titulo} (SKU: ${produto.sku}) deletado.`,
        });

        try {
            const loja = await this.lojaRepository.findById(produto.lojaId);
            if (!loja) {
                logger.warn(`[ProdutoService] Loja ${produto.lojaId} não encontrada para notificação de deleção.`);
                return result;
            }
            
            const acaoDeAdmin = loja.donoId !== actorId;

            if (acaoDeAdmin) {
                await this.notificacaoService.create({
                    userId: loja.donoId,
                    titulo: "Produto removido",
                    mensagem: `Seu produto "${produto.titulo}" foi removido da plataforma por um administrador.`,
                    tipo: TipoNotificacao.ALERTA,
                    prioridade: PRIORIDADE_NOTIFICACAO.CRITICA,
                    enviarEmail: true,
                });
            }
        } catch (error) {
            logger.error(`[ProdutoService] Falha ao enviar notificação de delete para produto ${id}`, error);
        }
    }

    return result;
  }
}
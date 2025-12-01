import { formatZodError } from "@/utils/formatZodError.js";
import { TCreateLojaInput, TUpdateLojaInput, createLojaSchema, updateLojaSchema } from "../schemas/loja.schema.js";
import { ConflictException, NotFoundException, ValidationException } from "@/utils/domain.js";
import { LojaRepository } from "../repositories/loja.repository.js";
import { TLojaResponse } from "../types/loja.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import { NotificacaoService, PRIORIDADE_NOTIFICACAO, TipoNotificacao } from "@/modules/notifications/types/notification.types.js";
import { QueueService } from "@/config/queue.js";
import { ActivityType, EntityType } from "@/modules/activity-log/types/activity-log.types.js";
import { logger } from "@/utils/logger.js";
import { matchError } from "@/utils/result.js";

const COMPONENT = "LojaService";

export class LojaService {
  private repository: LojaRepository;
  private userRepository: UserRepository;
  private notificacaoService: NotificacaoService;
  private queueService: typeof QueueService;

  constructor(
    repository: LojaRepository,
    userRepository: UserRepository,
    notificacaoService: NotificacaoService,
    queueService: typeof QueueService
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.notificacaoService = notificacaoService;
    this.queueService = queueService;
  }

  async create(data: TCreateLojaInput, actorId: string): Promise<string> {
    const validation = createLojaSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }

    const owner = await this.userRepository.findById(actorId);
    if (!owner) {
      throw new NotFoundException("Dono não encontrado", COMPONENT);
    }

    const existingLoja = await this.repository.findByNome(data.nome);
    if (existingLoja) {
      throw new ConflictException("Loja com esse nome já existe", COMPONENT);
    }

    const lojaId = await this.repository.create(validation.data, actorId);

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId, 
      activityType: ActivityType.LOJA_CREATED,
      entityType: EntityType.LOJA,
      entityId: lojaId,
      description: `Loja "${data.nome}" criada por ${actorId}.`,
      metadata: {
        nome: data.nome,
        donoId: actorId
      }
    });

    const notificationResult = await this.notificacaoService.create({
      userId: actorId,
      titulo: "Sua loja está em análise",
      mensagem: `A loja "${data.nome}" foi criada com sucesso e está aguardando aprovação de um administrador.`,
      tipo: TipoNotificacao.LOJA_PENDENTE,
      enviarEmail: true,
      prioridade: PRIORIDADE_NOTIFICACAO.MEDIA,
      link: `/minha-loja/${lojaId}`
    });

    
    if (!notificationResult.success) {
      const errorMessage = matchError(notificationResult.error, {
        VALIDATION_ERROR: (e) => `Erro de validação: ${e.message} - ${JSON.stringify(e.errors)}`,
        NOT_FOUND: (e) => `Erro de 'Não Encontrado': ${e.message} (Recurso: ${e.resource} ${e.resourceId})`,
        default: (e) => `Erro Padrão: ${e.type} - ${e.message}`
      });

      logger.warn(
        `[${COMPONENT}] Loja ${lojaId} criada, mas falha ao enviar notificação para ${actorId}: ${errorMessage}`
      );
    }
    

    return lojaId;
  }

  async findById(id: string): Promise<TLojaResponse> { 
    await IdMandatory(id);
    const loja = await this.repository.findById(id);
    if (!loja) {
      throw new NotFoundException("Loja não encontrada", COMPONENT);
    }
    return loja;
  }

  async findByNome(nome: string): Promise<TLojaResponse | null> {
    return await this.repository.findByNome(nome);
  }

  async findByDonoId(donoId: string): Promise<TLojaResponse[]> {
    await IdMandatory(donoId);
    return await this.repository.findByDonoId(donoId);
  }

  async getAll(page: number, limit: number, search?: string, status?: string) {
    validatePaginationParams(page, limit);
    const { data, total } = await this.repository.getAll({ page, limit, search, status });
    return {
      data,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), total }
    };
  }

  async aprovarLoja(id: string, aprovadoPor: string): Promise<TLojaResponse> {
    if (!id || typeof id !== 'string') {
      throw new ValidationException("ID da loja é obrigatório", COMPONENT);
    }
    
    if (!aprovadoPor || typeof aprovadoPor !== 'string') {
      throw new ValidationException("ID do aprovador é obrigatório", COMPONENT);
    }

    const loja = await this.findById(id);
    
    if (loja.status === "aprovado") {
      return loja
    }

    const approverExists = await this.userRepository.findById(aprovadoPor);
    if (!approverExists) {
      throw new NotFoundException("Aprovador não encontrado", COMPONENT);
    }

    const lojaAprovada = await this.repository.AprovarLoja(id, aprovadoPor);

    await this.queueService.publish("activity_log", "log_event", {
      userId: aprovadoPor,
      activityType: ActivityType.LOJA_APPROVED,
      entityType: EntityType.LOJA,
      entityId: id,
      description: `Loja "${lojaAprovada.nome}" (ID: ${id}) foi aprovada.`,
      metadata: {
        aprovadoPor,
        aprovadoEm: lojaAprovada.aprovadoEm
      }
    });

    const notificationResult = await this.notificacaoService.create({
      userId: lojaAprovada.donoId,
      titulo: "Sua loja foi APROVADA!",
      mensagem: `Parabéns! A loja "${lojaAprovada.nome}" foi aprovada e já está visível na plataforma.`,
      tipo: TipoNotificacao.ALERTA,
      link: `/loja/${lojaAprovada.nome || lojaAprovada.id}`
    });

    if (!notificationResult.success) {
      const errorMessage = matchError(notificationResult.error, {
        default: (e) => `${e.type}: ${e.message}`
      });
      logger.warn(
        `[${COMPONENT}] Loja ${id} aprovada, mas falha ao enviar notificação para ${lojaAprovada.donoId}: ${errorMessage}`
      );
    }

    return lojaAprovada;
  }

  async update(id: string, data: TUpdateLojaInput, actorId: string): Promise<TLojaResponse> { 
    const validation = updateLojaSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }

    await this.findById(id);
    
    if (data.nome) {
      const existingLoja = await this.repository.findByNome(data.nome);
      if (existingLoja && existingLoja.id !== id) {
        throw new ConflictException("Nome da loja já está em uso", COMPONENT);
      }
    }

    if (actorId) {
      const ownerExists = await this.userRepository.findById(actorId);
      if (!ownerExists) {
        throw new NotFoundException("Dono não encontrado", COMPONENT);
      }
    }

    const lojaDepois = await this.repository.update({ id, data });

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.LOJA_UPDATED,
      entityType: EntityType.LOJA,
      entityId: id,
      description: `Loja "${lojaDepois.nome}" (ID: ${id}) foi atualizada.`,
      metadata: {
        changes: data 
      }
    });

    return lojaDepois;
  }

  async delete(id: string, actorId: string): Promise<void> { 
    const loja = await this.findById(id); 

    await this.repository.delete(id);

    await this.queueService.publish("activity_log", "log_event", {
      userId: actorId,
      activityType: ActivityType.LOJA_DELETED,
      entityType: EntityType.LOJA,
      entityId: id,
      description: `Loja "${loja.nome}" (ID: ${id}) foi deletada.`,
      metadata: {
        nome: loja.nome,
        donoId: loja.donoId
      }
    });

    const notificationResult = await this.notificacaoService.create({
      userId: loja.donoId,
      titulo: "Sua loja foi removida",
      mensagem: `A sua loja "${loja.nome}" foi removida da plataforma. Entre em contato com o suporte para mais detalhes.`,
      tipo: TipoNotificacao.ALERTA,
      prioridade: PRIORIDADE_NOTIFICACAO.CRITICA,
      enviarEmail: true
    });

    
    if (!notificationResult.success) {
      const errorMessage = matchError(notificationResult.error, {
        default: (e) => `${e.type}: ${e.message}`
      });
      logger.warn(
        `[${COMPONENT}] Loja ${id} deletada, mas falha ao enviar notificação para ${loja.donoId}: ${errorMessage}`
      );
    }
    
  }
}

export default LojaService;
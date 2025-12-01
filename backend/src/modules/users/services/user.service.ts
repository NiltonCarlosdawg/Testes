import { formatZodError } from "@/utils/formatZodError.js";
import { createUserSchema, TCreateUserInput, TUpdateUserInput, updateUserSchema } from "../schemas/user.schema.js";
import { IUserRepository, TUserResponse } from "../types/user.types.js";
import { ConflictException, NotFoundException, ValidationException } from "@/utils/domain.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { IFAResponseService } from "@/types/query.types.js";
import { 
  NotificacaoService, 
  TipoNotificacao, 
  PRIORIDADE_NOTIFICACAO, 
} from "@/modules/notifications/types/notification.types.js";
import { logger } from "@/utils/logger.js";
import { matchError } from "@/utils/result.js"; 
import { TCreateNotificacaoInput } from "@/modules/notifications/schemas/notification.schema.js";

const COMPONENT = "UserService";

export class UserService {
  private repository: IUserRepository;
  private notificationService?: NotificacaoService;

  constructor(repository: IUserRepository, notificationService?: NotificacaoService) {
    this.repository = repository;
    this.notificationService = notificationService;
  }

  async create(userData: TCreateUserInput): Promise<string> {
    const validation = createUserSchema.safeParse(userData);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage);
    } 

    const existingEmail = await this.repository.findByEmail(userData.email);
    if (existingEmail) throw new ConflictException("Email already exists");

    const id = await this.repository.create(userData);

    if (this.notificationService) {
      try {
        const input: TCreateNotificacaoInput = {
          userId: id,
          titulo: "Bem-vindo(a)!",
          mensagem: `Olá ${userData.primeiroNome}! Sua conta foi criada com sucesso. Estamos felizes em tê-lo(a) conosco.`,
          tipo: TipoNotificacao.BEM_VINDO, 
          prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
          enviarEmail: true,
          link: '/meu-perfil',
          metadata: {
            action: "user_created",
            timestamp: new Date().toISOString()
          }
        };

        const notificationResult = await this.notificationService.create(input);

        if (!notificationResult.success) {
          const errorMsg = matchError(notificationResult.error, { default: (e) => e.message });
          logger.warn(`[${COMPONENT}] Falha ao enviar notificação de boas-vindas para usuário ${id}: ${errorMsg}`);
        }
      } catch (error) {
        logger.error(`[${COMPONENT}] Erro ao enviar notificação de boas-vindas:`, error);
      }
    }

    return id;
  }

  async findById(id: string): Promise<TUserResponse | null> {
    await IdMandatory(id);
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async getAll(page: number, limit: number, search?: string): Promise<IFAResponseService<TUserResponse>> {
    validatePaginationParams(page, limit);
    
    const { data, total } = await this.repository.getAll(page, limit, search);
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

  async update(id: string, data: TUpdateUserInput): Promise<TUserResponse> {
    const validation = updateUserSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage);
    } 

    const existingUser = await this.findById(id);
    if(!existingUser){
      throw new NotFoundException("User not found");
    }
    
    if (data.email) {
      const existingEmail = await this.repository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException("Email already in use");
      }
    }

    const updatedUser = await this.repository.update(id, data);

    if (this.notificationService) {
      try {
        const changedFields = Object.keys(data).filter(key => 
          data[key as keyof TUpdateUserInput] !== undefined
        );

        const shouldNotifyEmail = data.email ? data.email !== existingUser.email : false;
        
        const input: TCreateNotificacaoInput = {
          userId: id,
          titulo: "Perfil Atualizado",
          mensagem: `Seu perfil foi atualizado com sucesso. ${
            shouldNotifyEmail 
              ? `Seu novo email é: ${data.email}` 
              : `Campos alterados: ${changedFields.join(', ')}`
          }`,
          tipo: shouldNotifyEmail ? TipoNotificacao.SEGURANCA : TipoNotificacao.SISTEMA,
          prioridade: shouldNotifyEmail ? PRIORIDADE_NOTIFICACAO.ALTA : PRIORIDADE_NOTIFICACAO.MEDIA,
          enviarEmail: shouldNotifyEmail,
          link: '/meu-perfil/seguranca',
          metadata: {
            action: "user_updated",
            changedFields,
            timestamp: new Date().toISOString()
          }
        };
        
        const notificationResult = await this.notificationService.create(input);

        if (!notificationResult.success) {
          const errorMsg = matchError(notificationResult.error, { default: (e) => e.message });
          logger.warn(`[${COMPONENT}] Falha ao enviar notificação de atualização para usuário ${id}: ${errorMsg}`);
        }
      } catch (error) {
        logger.error(`[${COMPONENT}] Erro ao enviar notificação de atualização:`, error);
      }
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
        throw new NotFoundException("User not found");
    }
    
    if (this.notificationService) {
      try {
        const input = {
          userId: id,
          titulo: "Sua conta foi excluída",
          mensagem: `${user.primeiroNome}, sua conta foi excluída. Sentiremos sua falta!`,
          tipo: TipoNotificacao.SISTEMA,
          prioridade: PRIORIDADE_NOTIFICACAO.ALTA,
          enviarEmail: true, 
          forceEmail: true 
        };

        const notificationResult = await this.notificationService.createWithEmail(input);
        
        if (!notificationResult.success) {
            const errorMsg = matchError(notificationResult.error, { default: (e) => e.message });
            logger.warn(`[${COMPONENT}] Falha ao enviar notificação de exclusão para usuário ${id}: ${errorMsg}`);
        } else if (!notificationResult.value.emailSent) {
            logger.warn(`[${COMPONENT}] Notificação de exclusão criada para ${id}, mas o envio de e-mail falhou.`);
        }

      } catch (error) {
        logger.error(`[${COMPONENT}] Erro ao enviar notificação de exclusão:`, error);
      }
    }
    await this.repository.delete(id);
  }
  async sendNotification(
    userId: string, 
    titulo: string, 
    mensagem: string, 
    tipo: TipoNotificacao = TipoNotificacao.SISTEMA,
    options?: {
      prioridade?: PRIORIDADE_NOTIFICACAO;
      enviarEmail?: boolean;
      link?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    if (!this.notificationService) {
      logger.warn(`[${COMPONENT}] Serviço de notificação não configurado`);
      return;
    }

    await this.findById(userId); 

    try {
      const input: TCreateNotificacaoInput = {
        userId,
        titulo,
        mensagem,
        tipo,
        prioridade: options?.prioridade || PRIORIDADE_NOTIFICACAO.MEDIA,
        enviarEmail: options?.enviarEmail || false,
        link: options?.link || null,
        metadata: options?.metadata || null
      };

      const notificationResult = await this.notificationService.create(input);

      if (!notificationResult.success) {
        const errorMsg = matchError(notificationResult.error, { default: (e) => e.message });
        logger.warn(`[${COMPONENT}] Falha ao enviar notificação para usuário ${userId}: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error(`[${COMPONENT}] Erro ao enviar notificação personalizada:`, error);
      if (error instanceof Error) throw error; 
      else throw new Error(String(error));
    }
  }
}

export default UserService;
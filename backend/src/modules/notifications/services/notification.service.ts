import {
  TCreateNotificacaoInput,
  createNotificacaoSchema,
} from "../schemas/notification.schema.js";
import {
  NotificacaoRepository,
  TNotificacaoResponse,
  TNotificacaoQueryRequest,
  NotificacaoService,
} from "../types/notification.types.js";
import { IFAResponseService } from "@/types/query.types.js";
import { CacheService } from "@/config/cache.js";
import { QueueService } from "@/config/queue.js";

import { Result, Ok, Err, AppError, ErrorFactory } from "@/utils/result.js";
import { formatZodError } from "@/utils/formatZodError.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import { UserRepository } from "@/modules/users/repositories/user.repository.js";
import { logger } from "@/utils/logger.js";
import { EmailService } from "./email.service.js";
import { NewNotificationData } from "@/modules/email/email.templates.js";

const COMPONENT = "NotificacaoService";

type NotificacaoServiceDeps = {
  repository: NotificacaoRepository;
  userRepository: UserRepository;
  cache: typeof CacheService;
  queue: typeof QueueService;
  emailService: typeof EmailService;
};

export const createNotificacaoService = (
  deps: NotificacaoServiceDeps
): NotificacaoService => {
  const { repository, userRepository, cache, queue, emailService } = deps;

  const getCacheKey = (id: string) => `notificacao:${id}`;
  const getListCacheKey = (query: TNotificacaoQueryRequest) => {
    const { page = 1, limit = 10, search, userId, lida, tipo } = query;
    const parts = [userId, lida || 'all', tipo || 'all', page, limit, search || 'all'];
    return `notificacoes:list:${parts.join(':')}`;
  };
  const getUnreadCountCacheKey = (userId: string) => `notificacao:unread_count:${userId}`;
  
  const invalidateUserCaches = async (userId: string) => {
      await cache.deletePattern(`notificacoes:list:${userId}:*`);
      await cache.delete(getUnreadCountCacheKey(userId));
  };


  const sendNotificationEmail = async (
    userEmail: string,
    userName: string,
    data: Pick<NewNotificationData, 'titulo' | 'tipo' | 'mensagem' | 'link'> 
  ): Promise<void> => {
    try {
      const emailResult = await emailService.sendEmail('new_notification', userEmail, {
        titulo: data.titulo,
        tipo: data.tipo,
        nomeUsuario: userName,
        mensagem: data.mensagem,
        link: data.link,
      });

      if (!emailResult.success) {
        logger.warn(`[${COMPONENT}] Falha ao enviar email de notificação para ${userEmail}: ${emailResult.error}`);
      } else {
        logger.info(`[${COMPONENT}] Email de notificação enviado com sucesso para ${userEmail}`);
      }
    } catch (error) {
      logger.error(`[${COMPONENT}] Erro ao enviar email de notificação:`, error);
    }
  };

  const shouldSendEmail = (tipo: string): boolean => {
    const emailWorthyTypes = [
      'urgente',
      'importante', 
      'sistema',
      'promocao',
      'seguranca'
    ];
    return emailWorthyTypes.includes(tipo);
  };



  const service: NotificacaoService = {
    create: async (
      data: TCreateNotificacaoInput
    ): Promise<Result<string, AppError>> => {
      const validation = createNotificacaoSchema.safeParse(data);
      if (!validation.success) {
        return Err(ErrorFactory.validation(formatZodError(validation.error), COMPONENT));
      }

      // A flag 'enviarEmail' será extraída mas não usada para decisão
      const { userId, titulo, tipo, enviarEmail, mensagem, link } = validation.data;
      logger.info(enviarEmail)
      const user = await userRepository.findById(userId);
      if (!user) {
        return Err(ErrorFactory.notFound("Usuário destinatário não encontrado", "usuario", userId, COMPONENT));
      }

      const id = await repository.create(validation.data);
      await invalidateUserCaches(userId);

      // ** EVENT-DRIVEN: Publica eventos na fila
      try {
        await queue.publish("notification_created", "new_notification", {
          id,
          userId,
          titulo: titulo,
          tipo: tipo,
          timestamp: new Date().toISOString(),
        });

        await queue.publish("activity_log", "log_event", {
          actorId: "system", 
          action: "notification_sent",
          targetId: id,
          targetType: "notification",
          details: `Notificação "${titulo}" enviada para ${user.email}`,
          userId: userId, 
          metadata: {
            tipo: tipo,
            enviarEmail: true, // Atualizamos o log para refletir que o email SEMPRE será enviado
            forceSent: true    // Adicionamos esta flag para clareza no log
          }
        });
      } catch (queueError) {
        logger.error("Falha ao publicar evento na fila:", queueError);
      }

      // --- MODIFICAÇÃO AQUI ---
      // A condição 'if (enviarEmail || shouldSendEmail(tipo))' FOI REMOVIDA.
      // O bloco de envio de email agora executa incondicionalmente.
      Promise.resolve().then(async () => {
        try {
          await sendNotificationEmail(
            user.email,
            user.primeiroNome,
            { titulo, tipo, mensagem, link: link ? link : "" } 
          );

          await queue.publish("activity_log", "log_event", {
            actorId: "system",
            action: "notification_email_sent",
            targetId: id,
            targetType: "notification",
            details: `Email de notificação (forçado) "${titulo}" enviado para ${user.email}`,
            userId: userId,
          });
        } catch (emailError) {
          logger.error(`[${COMPONENT}] Erro no envio de email em background:`, emailError);
        }
      }).catch(error => {
        logger.error(`[${COMPONENT}] Erro não tratado no envio de email em background:`, error);
      });
      // --- FIM DA MODIFICAÇÃO ---

      return Ok(id);
    },

    createBatch: async (
      notifications: TCreateNotificacaoInput[]
    ): Promise<Result<{ successes: string[]; failures: Array<{ index: number; error: string }> }, AppError>> => {
      const successes: string[] = [];
      const failures: Array<{ index: number; error: string }> = [];

      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
        
        try {
          const validation = createNotificacaoSchema.safeParse(notification);
          if (!validation.success) {
            failures.push({
              index: i,
              error: `Validação falhou: ${formatZodError(validation.error)}`
            });
            continue;
          }

          const { userId } = validation.data;
          const user = await userRepository.findById(userId);
          if (!user) {
            failures.push({
              index: i,
              error: `Usuário não encontrado: ${userId}`
            });
            continue;
          }

          const id = await repository.create(validation.data);
          await invalidateUserCaches(userId);
          successes.push(id);

          if (validation.data.enviarEmail || shouldSendEmail(validation.data.tipo)) {
            Promise.resolve().then(async () => {
              await sendNotificationEmail(
                user.email,
                user.primeiroNome,
                {
                  titulo:validation.data.titulo,
                  tipo:validation.data.tipo
                }
              );
            }).catch(error => {
              logger.error(`[${COMPONENT}] Erro no envio de email em lote para ${user.email}:`, error);
            });
          }

        } catch (error) {
          failures.push({
            index: i,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
      try {
        await queue.publish("notification_batch_processed", "batch_completed", {
          total: notifications.length,
          successes: successes.length,
          failures: failures.length,
          timestamp: new Date().toISOString(),
        });
      } catch (queueError) {
        logger.error("Falha ao publicar evento de lote:", queueError);
      }

      return Ok({ successes, failures });
    },

    findById: async (
      id: string,
      userId: string
    ): Promise<Result<TNotificacaoResponse, AppError>> => {
      if (!id) return Err(ErrorFactory.validation("ID é obrigatório", COMPONENT));

      const cacheKey = getCacheKey(id);
      const item = await cache.getOrSet(cacheKey, 3600, async () => {
        return repository.findById(id);
      });

      if (!item) {
        return Err(ErrorFactory.notFound("Notificação não encontrada", "notificacao", id, COMPONENT));
      }
      if (item.userId !== userId) {
        return Err(ErrorFactory.notFound("Notificação não encontrada", "notificacao", id, COMPONENT));
      }

      return Ok(item);
    },

    findByUserId: async (
      query: TNotificacaoQueryRequest
    ): Promise<Result<IFAResponseService<TNotificacaoResponse>, AppError>> => {
      const page = query.page ? Number(query.page) : 1;
      const limit = query.limit ? Number(query.limit) : 10;
      validatePaginationParams(page, limit);
      if (!query.userId) {
          return Err(ErrorFactory.validation("userId é obrigatório", COMPONENT));
      }

      const cacheKey = getListCacheKey(query);
      const result = await cache.getOrSet(cacheKey, 60, async () => {
        const { data, total } = await repository.findByUserId(query);
        return {
          data,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
          },
        };
      });

      return Ok(result);
    },
    
    getUnreadCount: async (userId: string): Promise<Result<{ count: number }, AppError>> => {
        const cacheKey = getUnreadCountCacheKey(userId);
        const count = await cache.getOrSet(cacheKey, 60, async () => {
            return repository.getUnreadCount(userId);
        });
        
        return Ok({ count });
    },

    markAsRead: async (
      id: string,
      userId: string
    ): Promise<Result<TNotificacaoResponse, AppError>> => {
      const updated = await repository.markAsRead(id, userId);
      
      if (!updated) {
        const exists = await repository.findById(id);
        if (!exists || exists.userId !== userId) {
            return Err(ErrorFactory.notFound("Notificação não encontrada", "notificacao", id, COMPONENT));
        }
        return Ok(exists);
      }

      await cache.invalidate("notificacao", id);
      await invalidateUserCaches(userId);

      try {
        await queue.publish("notification_read", "notification_marked_read", {
          notificationId: id,
          userId: userId,
          timestamp: new Date().toISOString(),
        });
      } catch (queueError) {
        logger.error("Falha ao publicar evento de notificação lida:", queueError);
      }

      return Ok(updated);
    },
    
    markAllAsRead: async (userId: string): Promise<Result<{ count: number }, AppError>> => {
        const result = await repository.markAllAsRead(userId);
        
        if (result.count > 0) {
            await cache.deletePattern(`notificacao:*:${userId}*`); 
            await invalidateUserCaches(userId);

            try {
              await queue.publish("notification_read_all", "all_notifications_marked_read", {
                userId: userId,
                count: result.count,
                timestamp: new Date().toISOString(),
              });
            } catch (queueError) {
              logger.error("Falha ao publicar evento de todas as notificações lidas:", queueError);
            }
        }
        
        return Ok(result);
    },

    createWithEmail: async (
      data: TCreateNotificacaoInput & { forceEmail: boolean }
    ): Promise<Result<{ notificationId: string; emailSent: boolean }, AppError>> => {
      const validation = createNotificacaoSchema.safeParse(data);
      if (!validation.success) {
        return Err(ErrorFactory.validation(formatZodError(validation.error), COMPONENT));
      }

      const { userId, titulo, tipo } = validation.data;
      const user = await userRepository.findById(userId);
      if (!user) {
        return Err(ErrorFactory.notFound("Usuário destinatário não encontrado", "usuario", userId, COMPONENT));
      }

      const id = await repository.create(validation.data);
      await invalidateUserCaches(userId);

      let emailSent = false;

      if (data.forceEmail) {
        try {
          const emailResult = await emailService.sendEmail('new_notification', user.email, {
            titulo: titulo,
            tipo: tipo,
            nomeUsuario: user.primeiroNome,
          });

          emailSent = emailResult.success;

          if (emailResult.success) {
            logger.info(`[${COMPONENT}] Email crítico enviado com sucesso para ${user.email}`);
          } else {
            logger.warn(`[${COMPONENT}] Falha ao enviar email crítico para ${user.email}: ${emailResult.error}`);
          }
        } catch (error) {
          logger.error(`[${COMPONENT}] Erro crítico ao enviar email para ${user.email}:`, error);
        }
      }

      try {
        await queue.publish("notification_created", "new_notification_with_email", {
          id,
          userId,
          titulo,
          tipo,
          emailSent,
          timestamp: new Date().toISOString(),
        });
      } catch (queueError) {
        logger.error("Falha ao publicar evento de notificação com email:", queueError);
      }

      return Ok({ notificationId: id, emailSent });
    }
  };

  return service;
};


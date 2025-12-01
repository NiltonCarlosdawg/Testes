import 'dotenv/config';
import { Worker } from 'bullmq';
import { createActivityLogRepository } from '@/modules/activity-log/repositories/activity-log.repository.js';
import db from '@/config/database.js';
import { createActivityLogService } from '@/modules/activity-log/services/activity-log.service.js';
import { UserRepository } from '@/modules/users/repositories/user.repository.js'; 
import { CacheService } from '@/config/cache.js';
import { logger } from '@/utils/logger.js';
import { pubSubClient, redisConnection } from '@/config/redis.js';
import { EmailService } from '@/modules/notifications/services/email.service.js';

const COMPONENT = "QueueWorker";

const activityLogRepository = createActivityLogRepository(db);
const userRepository = new UserRepository();
const activityLogService = createActivityLogService({
  repository: activityLogRepository,
  userRepository: userRepository, 
  cache: CacheService,
});

const activityLogWorker = new Worker(
  "activity_log",
  async (job) => {
    logger.info(`[${COMPONENT}] Processando job ${job.name} (ID: ${job.id}) da fila activity_log`);
    const logData = job.data; 

    const result = await activityLogService.create(logData);

    if (!result.success) {
      logger.error(`[${COMPONENT}] Falha ao processar job ${job.id} de activity_log:`, result.error);
      throw result.error;
    }

    logger.info(`[${COMPONENT}] Job ${job.id} de activity_log concluído. Log ID: ${result.value}`);
    return result.value;
  },
  { connection: redisConnection }
);

const notificationWorker = new Worker(
  "notification_created",
  async (job) => {
    logger.info(`[${COMPONENT}] Processando job ${job.name} (ID: ${job.id}) da fila notification_created`);
    
    const { id, userId, titulo, tipo } = job.data;
    
    try {
      const payload = {
        type: "NEW_NOTIFICATION",
        data: { id, titulo, tipo, lida: false, createdAt: new Date().toISOString() }
      };

      const message = JSON.stringify({
        userId: userId,
        payload: payload
      });

      await pubSubClient.publish("ws:notifications", message);
      
      logger.info(`[${COMPONENT}] Evento de notificação ${id} publicado no Redis PubSub para usuário ${userId}`);
      return { status: "published_to_pubsub" };

    } catch (error) {
       logger.error(`[${COMPONENT}] Falha ao publicar no Redis PubSub`, error);
       throw error; 
    }
  },
  { connection: redisConnection }
);

const notificationReadWorker = new Worker(
  "notification_read",
  async (job) => {
    logger.info(`[${COMPONENT}] Processando job ${job.name} (ID: ${job.id}) da fila notification_read`);
    
    const { notificationId, userId } = job.data;
    
    try {
      const payload = {
        type: "NOTIFICATION_READ",
        data: { notificationId, userId, timestamp: new Date().toISOString() }
      };

      const message = JSON.stringify({
        userId: userId,
        payload: payload
      });

      await pubSubClient.publish("ws:notifications", message);
      
      logger.info(`[${COMPONENT}] Evento de notificação lida ${notificationId} publicado no Redis PubSub`);
      return { status: "published_to_pubsub" };

    } catch (error) {
       logger.error(`[${COMPONENT}] Falha ao publicar evento de notificação lida`, error);
       throw error; 
    }
  },
  { connection: redisConnection }
);

const notificationReadAllWorker = new Worker(
  "notification_read_all",
  async (job) => {
    logger.info(`[${COMPONENT}] Processando job ${job.name} (ID: ${job.id}) da fila notification_read_all`);
    
    const { userId, count } = job.data;
    
    try {
      const payload = {
        type: "ALL_NOTIFICATIONS_READ",
        data: { userId, count, timestamp: new Date().toISOString() }
      };

      const message = JSON.stringify({
        userId: userId,
        payload: payload
      });

      await pubSubClient.publish("ws:notifications", message);
      
      logger.info(`[${COMPONENT}] Evento de todas as notificações lidas publicado para usuário ${userId}`);
      return { status: "published_to_pubsub" };

    } catch (error) {
       logger.error(`[${COMPONENT}] Falha ao publicar evento de todas as notificações lidas`, error);
       throw error; 
    }
  },
  { connection: redisConnection }
);

const notificationBatchWorker = new Worker(
  "notification_batch_processed",
  async (job) => {
    logger.info(`[${COMPONENT}] Processando job ${job.name} (ID: ${job.id}) da fila notification_batch_processed`);
    
    const { total, successes, failures } = job.data;
    
    logger.info(`[${COMPONENT}] Lote processado: ${successes} sucessos, ${failures} falhas de ${total} notificações`);
    
    return { 
      status: "batch_processed",
      total,
      successes, 
      failures 
    };
  },
  { connection: redisConnection }
);

const emailWorker = new Worker(
  "email",
  async (job) => {
    logger.info(`[${COMPONENT}] Processando job ${job.name} (ID: ${job.id}) da fila email`);
    
    const { template, to, emailData } = job.data;
    
    if (!template || !to || !emailData) {
        logger.error(`[${COMPONENT}] Job de email ${job.id} inválido. Faltando dados.`);
        return; 
    }

    try {
      await EmailService.sendEmail(template, to, emailData);
      logger.info(`[${COMPONENT}] Job de email ${job.id} para ${to} concluído.`);
    } catch (error) {
       logger.error(`[${COMPONENT}] Job de email ${job.id} falhou.`, error);
       throw error;
    }
  },
  { connection: redisConnection }
);

const setupWorkerListeners = (worker: Worker, workerName: string) => {
  worker.on("completed", (job, result) => {
    logger.info(`[${workerName}] Job ${job?.id} completed. Result: ${JSON.stringify(result)}`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[${workerName}] Job ${job?.id} failed with error: ${err.message}`, err.stack);
  });

  worker.on("error", (err) => {
    logger.error(`[${workerName}] Worker error: ${err.message}`, err.stack);
  });
};

const workers = [
  { worker: activityLogWorker, name: "activity_log" },
  { worker: notificationWorker, name: "notification_created" },
  { worker: notificationReadWorker, name: "notification_read" },
  { worker: notificationReadAllWorker, name: "notification_read_all" },
  { worker: notificationBatchWorker, name: "notification_batch_processed" },
  { worker: emailWorker, name: "email" },
];

workers.forEach(({ worker, name }) => setupWorkerListeners(worker, name));

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  logger.info(`[${COMPONENT}] Encerrando workers gracefully...`);

  await Promise.all(workers.map(({ worker }) => worker.close()));

  logger.info(`[${COMPONENT}] Todos os workers encerrados.`);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

logger.info("Workers iniciados e escutando todas as filas...");

export { 
  activityLogWorker, 
  notificationWorker, 
  notificationReadWorker,
  notificationReadAllWorker,
  notificationBatchWorker,
  emailWorker 
};
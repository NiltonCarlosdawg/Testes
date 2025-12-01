import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export const activityLogQueue = new Queue("activity_log", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, 
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true, 
    removeOnFail: { count: 1000 }, 
  },
});

export const notificationQueue = new Queue("notification_created", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, 
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true, 
    removeOnFail: { count: 1000 }, 
  },
});

export const notificationReadQueue = new Queue("notification_read", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: { count: 1000 },
  },
});

export const notificationReadAllQueue = new Queue("notification_read_all", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: { count: 1000 },
  },
});

export const notificationBatchQueue = new Queue("notification_batch_processed", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: { count: 1000 },
  },
});

export const emailQueue = new Queue("email", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000, 
    },
    removeOnComplete: true,
    removeOnFail: { count: 1000 },
  },
});

// Tipos das filas disponíveis
export type QueueName = 
  | "activity_log" 
  | "notification_created" 
  | "notification_read"
  | "notification_read_all"
  | "notification_batch_processed"
  | "email";

export const QueueService = {
  /**
   * Publica um trabalho em uma fila especificada.
   */
  publish: async (
    queueName: QueueName,
    jobName: string,
    data: unknown
  ): Promise<void> => {
    let queueInstance: Queue;

    switch (queueName) {
      case "activity_log":
        queueInstance = activityLogQueue;
        break;
      case "notification_created":
        queueInstance = notificationQueue;
        break;
      case "notification_read":
        queueInstance = notificationReadQueue;
        break;
      case "notification_read_all":
        queueInstance = notificationReadAllQueue;
        break;
      case "notification_batch_processed":
        queueInstance = notificationBatchQueue;
        break;
      case "email":
        queueInstance = emailQueue;
        break;
      default:
        console.error(`[QueueService] Fila desconhecida: ${queueName}`);
        return;
    }

    try {
      await queueInstance.add(jobName, data);
      console.log(`[QueueService] Job ${jobName} adicionado à fila ${queueName}`);
    } catch (error) {
      console.error(
        `[QueueService] Falha ao publicar job na fila ${queueName}`,
        error
      );
    }
  },
};
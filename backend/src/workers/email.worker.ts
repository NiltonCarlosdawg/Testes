// src/workers/email.worker.ts
import { Worker } from "bullmq";
import { redisConnection } from "@/config/redis.js";
import { EmailService } from "@/modules/notifications/services/email.service.js";
import { logger } from "@/utils/logger.js";

console.log("Worker de e-mail iniciado (BullMQ)...");

const emailWorker = new Worker(
  "email",
  async (job) => {
    const { templateName, to, data } = job.data;

    logger.info(`[Worker] Processando e-mail: ${templateName} → ${to}`);

    const result = await EmailService.sendEmail(templateName, to, data);

    if (!result.success) {
      throw new Error(result.error);
    }

    logger.info(`[Worker] E-mail enviado com sucesso: ${to}`);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

emailWorker.on("failed", (job, err) => {
  logger.error(`[Worker] Falha no job ${job?.id}:`, err);
});

emailWorker.on("completed", (job) => {
  logger.info(`[Worker] Job ${job.id} concluído`);
});
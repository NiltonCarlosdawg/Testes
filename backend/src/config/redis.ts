import { logger } from '@/utils/logger.js';
import { Redis } from 'ioredis';
import dotenv from "dotenv"

dotenv.config()

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

// Para Cache
export const redisClient = new Redis(redisConfig); 

// Para BullMQ
export const redisConnection = new Redis(redisConfig); 

// Cliente dedicado para Pub/Sub
export const pubSubClient = new Redis(redisConfig); 

redisClient.on('connect', () => {
  logger.info('[Redis] Conectado (Cache)');
});
redisClient.on('error', (err) => {
  logger.error('[Redis] Error (Cache):', err);
});

redisConnection.on("connect", () =>
  logger.info(`[Redis] Conectado (Queue) em ${process.env.REDIS_HOST}`)
);
redisConnection.on("error", (err) => {
  logger.error('[Redis] Error (Queue):', err);
});

pubSubClient.on("connect", () =>
  logger.info(`[Redis] Conectado (PubSub) em ${process.env.REDIS_HOST}`)
);
pubSubClient.on("error", (err) => {
  logger.error('[Redis] Error (PubSub):', err);
});
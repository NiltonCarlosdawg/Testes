import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from '@/config/env.js';
import { logger } from './utils/logger.js';
import { httpLoggingHook, errorLoggingHook } from './middleware/logging.js';
import healthRoutes from '@/modules/users/routes/health.js';
import authRoutes from './modules/users/routes/auth.routes.js';
import { UserRoutes } from './modules/users/routes/user.routes.js';
import { RoleRoutes } from './modules/roles/routes/role.routes.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'; 
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { LojaRoutes } from './modules/lojas/routes/loja.routes.js';
import { CategoriaRoutes } from './modules/categorias/routes/categoria.routes.js';
import { ProdutoRoutes } from './modules/produtos/routes/produto.routes.js';
import { CarrinhoItemRoutes } from './modules/carrinho-itens/routes/carrinho-itens.routes.js';
import { LojaAvaliacaoRoutes } from './modules/lojas/routes/loja-avaliacoes.routes.js';
import { PedidoRoutes } from './modules/pedidos/routes/pedido.routes.js';
import { NotificacaoRoutes } from './modules/notifications/routes/notification.routes.js';
import fastifyWebsocket from '@fastify/websocket';
import { pubSubClient } from './config/redis.js';
import { authResultHook } from './middleware/auth.middleware.js';
import { ActivityLogRoutes } from './modules/activity-log/routes/activity-log.routes.js';


const PORT = env.PORT;
const HOST = env.HOST;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const server = Fastify({
  logger: env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        },
        level: env.LOG_LEVEL,
      }
    : {
        level: env.LOG_LEVEL,
      },
});

async function buildServer(): Promise<FastifyInstance> {
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"],
        connectSrc: [
          "'self'", 
          "https://calunga.shop/api/v1/",
          "https://calunga.shop",
          "http://127.0.0.1:3000", 
          "http://localhost:3000",
          "http://127.0.0.1:3001",
          "http://localhost:3001",
          "ws://127.0.0.1:3000",
          "ws://localhost:3000"
        ],
      },
    },
  });

  await server.register(multipart, {
    limits: {
      fileSize: 30 * 1024 * 1024,
      files: 5,
    }
  });

  const uploadsPath = path.resolve(__dirname, '..', 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    logger.info(`Diretório de uploads criado em: ${uploadsPath}`);
  }

  await server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/api/v1/dashboard/',
    decorateReply: false 
  });

  server.register(fastifyStatic, {
    root: uploadsPath,
    prefix: '/uploads/',
    decorateReply: false
  });
  await server.register(fastifyWebsocket);
  await server.register(cors, {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute', 
    errorResponseBuilder: () => {
      return {
        error: {
          message: 'Too many requests, please try again later.',
          statusCode: 429,
        },
      };
    },
  });
  

  server.addHook('preHandler', httpLoggingHook);
  server.setErrorHandler(errorLoggingHook);


  const connections = new Map<string, any>(); 

  server.register(async (fastify) => {
    fastify.addHook("preHandler", authResultHook); 

    fastify.get('/ws', { websocket: true }, (connection, req) => {
      const userId = req.user?.userId

      if (!userId) {
        connection.socket.send(JSON.stringify({ error: "Não autenticado" }));
        connection.socket.close(1008, "Não autenticado");
        return;
      }
      
      logger.info(`[WebSocket] Usuário ${userId} conectado.`);
      connections.set(userId, connection.socket);

      connection.socket.on('message', (message: string) => {
        if (message.toString() === 'ping') {
          connection.socket.send(JSON.stringify({ type: 'pong' }));
        }
      });

      connection.socket.on('close', () => {
        logger.info(`[WebSocket] Usuário ${userId} desconectado.`);
        connections.delete(userId);
      });
      
      connection.socket.on('error', (error: unknown) => {
        const errorMessage = error instanceof Error ? error : String(error)
        logger.error(`[WebSocket] Erro no usuário ${userId}:`, errorMessage);
        connections.delete(userId);
      });
    });
  });
  const subscriber = pubSubClient.duplicate(); 
  
  subscriber.subscribe("ws:notifications", (err) => {
    if (err) {
      logger.error("[Redis PubSub] Falha ao se inscrever no canal 'ws:notifications'", err);
    } else {
      logger.info("[Redis PubSub] Inscrito no canal 'ws:notifications'");
    }
  });

  subscriber.on("message", (channel, message) => {
    if (channel === "ws:notifications") {
      try {
        const data = JSON.parse(message);
        const { userId, payload } = data;
        
        const socket = connections.get(userId);
        if (socket && socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(payload));
          logger.info(`[WebSocket] Mensagem enviada para o usuário ${userId}`);
        } else {
          logger.warn(`[WebSocket] Usuário ${userId} não encontrado ou não conectado.`);
        }
      } catch (e) {
        logger.error("[Redis PubSub] Falha ao processar mensagem do canal", e);
      }
    }
  });


  const API_PREFIX = "/api/v1";

  await server.register(healthRoutes, { prefix: `${API_PREFIX}/health` });
  await server.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await server.register(UserRoutes, { prefix: `${API_PREFIX}/users` });
  await server.register(RoleRoutes, { prefix: `${API_PREFIX}/roles` });
  await server.register(LojaRoutes, { prefix: `${API_PREFIX}/lojas` });
  await server.register(CategoriaRoutes, { prefix: `${API_PREFIX}/categorias` });
  await server.register(CarrinhoItemRoutes, { prefix: `${API_PREFIX}/carrinho` })
  await server.register(ProdutoRoutes, { prefix: `${API_PREFIX}/produtos` });
  await server.register(LojaAvaliacaoRoutes, { prefix: `${API_PREFIX}/loja-avaliacoes` });
  await server.register(PedidoRoutes, { prefix: `${API_PREFIX}/pedidos` });
  await server.register(NotificacaoRoutes, { prefix: `${API_PREFIX}/notificacoes` });
  await server.register(ActivityLogRoutes, { prefix: `${API_PREFIX}/logs` });

  server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        message: 'Route not found',
        statusCode: 404,
        path: request.url,
        method: request.method,
      },
    });
  });

  return server;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: HOST });
    logger.info(`Server listening on http://${HOST}:${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  try {
    await server.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

start();

export { buildServer };

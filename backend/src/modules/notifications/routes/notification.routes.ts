import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authResultHook } from "@/middleware/auth.middleware.js";
import { rbacMiddlewareResult } from "@/middleware/rbac.middleware.js";
import db from "@/config/database.js";
import { CacheService } from "@/config/cache.js";
import { QueueService } from "@/config/queue.js";
import { createNotificacaoRepository } from "../repositories/notification.repository.js";
import { createNotificacaoService } from "../services/notification.service.js";
import { createNotificacaoController } from "../controllers/notification.controller.js";
import { EmailService } from "../services/email.service.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";

export const NotificacaoRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  fastify.addHook("preHandler", authResultHook);

  const userRepository = new UserRepository()
  const notificacaoRepository = createNotificacaoRepository(db);

  const notificacaoService = createNotificacaoService({
    repository: notificacaoRepository,
    userRepository,
    cache: CacheService,
    queue: QueueService,
    emailService: EmailService,
  });

  const notificacaoController = createNotificacaoController(notificacaoService);

  // === ROTAS COM RBAC (Result) ===
  fastify.get("/my", {
    preHandler: [rbacMiddlewareResult(["notificacoes:read"])],
    handler: notificacaoController.findByUserId,
  });

  fastify.get("/my/unread-count", {
    preHandler: [rbacMiddlewareResult(["notificacoes:read"])],
    handler: notificacaoController.getUnreadCount,
  });

  fastify.put("/my/mark-all-read", {
    preHandler: [rbacMiddlewareResult(["notificacoes:mark_read"])],
    handler: notificacaoController.markAllAsRead,
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddlewareResult(["notificacoes:read"])],
    handler: notificacaoController.findById,
  });

  fastify.put("/:id/read", {
    preHandler: [rbacMiddlewareResult(["notificacoes:mark_read"])],
    handler: notificacaoController.markAsRead,
  });

  fastify.post("/", {
    preHandler: [rbacMiddlewareResult(["notificacoes:create"])],
    handler: notificacaoController.create,
  });
};
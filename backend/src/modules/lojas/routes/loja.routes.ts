import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { LojaController } from "@/modules/lojas/controllers/loja.controller.js";
import { LojaRepository } from "@/modules/lojas/repositories/loja.repository.js";
import LojaService from "../services/loja.service.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import { createNotificacaoService } from "@/modules/notifications/services/notification.service.js";
import { createNotificacaoRepository } from "@/modules/notifications/repositories/notification.repository.js";
import db from "@/config/database.js";
import { CacheService } from "@/config/cache.js";
import { QueueService } from "@/config/queue.js";
import { EmailService } from "@/modules/notifications/services/email.service.js";

export const LojaRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const userRepository = new UserRepository();
  const notificacaoRepository = createNotificacaoRepository(db);
  const notificacaoService = createNotificacaoService({
    repository: notificacaoRepository,
    userRepository,
    cache: CacheService,
    queue: QueueService,
    emailService: EmailService,
  });

  const lojaRepository = new LojaRepository();
  const lojaService = new LojaService(lojaRepository, userRepository, notificacaoService, QueueService);
  const lojaController = new LojaController(lojaService);

  fastify.addHook("preHandler", authMiddleware);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["lojas:create"])],
    handler: lojaController.create.bind(lojaController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["lojas:read"])],
    handler: lojaController.getAll.bind(lojaController),
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["lojas:read"])],
    handler: lojaController.findById.bind(lojaController),
  });

  fastify.get("/dono/:donoId", {
    preHandler: [rbacMiddleware(["lojas:read"])],
    handler: lojaController.findByDonoId.bind(lojaController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["lojas:update"])],
    handler: lojaController.update.bind(lojaController),
  });

  fastify.patch("/:id/aprovar", {
    preHandler: [rbacMiddleware(["lojas:approve"])],
    handler: lojaController.aprovarLoja.bind(lojaController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["lojas:delete"])],
    handler: lojaController.delete.bind(lojaController),
  });
};
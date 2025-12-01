import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { ProdutoRepository } from "../repositories/produto.repository.js";
import { ProdutoService } from "../services/produto.service.js";
import { ProdutoController } from "../controllers/produto.controller.js";
import { createNotificacaoService } from "@/modules/notifications/services/notification.service.js";
import { createNotificacaoRepository } from "@/modules/notifications/repositories/notification.repository.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import LojaRepository from "@/modules/lojas/repositories/loja.repository.js";
import db from "@/config/database.js";
import { CacheService } from "@/config/cache.js";
import { QueueService } from "@/config/queue.js";
import { EmailService } from "@/modules/notifications/services/email.service.js";

export const ProdutoRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const userRepository = new UserRepository();
  const lojaRepository = new LojaRepository();
  const notificacaoRepository = createNotificacaoRepository(db);
  const notificacaoService = createNotificacaoService({
    repository: notificacaoRepository,
    userRepository,
    cache: CacheService,
    queue: QueueService,
    emailService: EmailService,
  });

  const produtoRepository = new ProdutoRepository();
  const produtoService = new ProdutoService(
    produtoRepository,
    lojaRepository,
    notificacaoService,
    QueueService
  );
  const produtoController = new ProdutoController(produtoService);

  fastify.post("/", {
    preHandler: [authMiddleware, rbacMiddleware(["produtos:create"])],
    handler: produtoController.create.bind(produtoController),
  });

  fastify.get("/", {
    handler: produtoController.getAll.bind(produtoController),
  });

  fastify.get("/filters", {
    handler: produtoController.getFilterOptions.bind(produtoController),
  });

  fastify.get("/:id", {
    handler: produtoController.findById.bind(produtoController),
  });

  fastify.get("/loja/:id", {
    handler: produtoController.findByLoja.bind(produtoController),
  });

  fastify.put("/:id", {
    preHandler: [authMiddleware, rbacMiddleware(["produtos:update"])],
    handler: produtoController.update.bind(produtoController),
  });

  fastify.delete("/:id", {
    preHandler: [authMiddleware, rbacMiddleware(["produtos:delete"])],
    handler: produtoController.delete.bind(produtoController),
  });
};
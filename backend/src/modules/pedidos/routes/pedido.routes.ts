import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { PedidoController } from "../controllers/pedido.controller.js";
import { PedidoRepository } from "../repositories/pedido.repository.js";
import { PedidoService } from "../services/pedido.service.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import LojaRepository from "@/modules/lojas/repositories/loja.repository.js";
import { ProdutoRepository } from "@/modules/produtos/repositories/produto.repository.js";
import { createNotificacaoRepository } from "@/modules/notifications/repositories/notification.repository.js";
import { createNotificacaoService } from "@/modules/notifications/services/notification.service.js";
import { CacheService } from "@/config/cache.js";
import { QueueService } from "@/config/queue.js";
import { EmailService } from "@/modules/notifications/services/email.service.js";
import db from "@/config/database.js";

export const PedidoRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);

  const userRepository = new UserRepository();
  const lojaRepository = new LojaRepository();
  const produtoRepository = new ProdutoRepository();
  const pedidoRepository = new PedidoRepository();

  const notificacaoRepository = createNotificacaoRepository(db);
  const notificacaoService = createNotificacaoService({
    repository: notificacaoRepository,
    userRepository,
    cache: CacheService,
    queue: QueueService,
    emailService: EmailService,
  });

  const pedidoService = new PedidoService(
    pedidoRepository,
    userRepository,
    lojaRepository,
    produtoRepository,
    notificacaoService,
    QueueService
  );

  const pedidoController = new PedidoController(pedidoService);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["pedidos:create"])],
    handler: pedidoController.create.bind(pedidoController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.getAll.bind(pedidoController),
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.findById.bind(pedidoController),
  });

  fastify.get("/comprador/:compradorId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.findByCompradorId.bind(pedidoController),
  });

  fastify.get("/loja/:lojaId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.findByLojaId.bind(pedidoController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["pedidos:update"])],
    handler: pedidoController.update.bind(pedidoController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["pedidos:delete"])],
    handler: pedidoController.delete.bind(pedidoController),
  });

  fastify.patch("/:id/status", {
    preHandler: [rbacMiddleware(["pedidos:update"])],
    handler: pedidoController.updateStatus.bind(pedidoController),
  });

  fastify.post("/:id/cancel", {
    preHandler: [rbacMiddleware(["pedidos:cancel"])],
    handler: pedidoController.cancel.bind(pedidoController),
  });

  // Dashboard (apenas dono da loja ou admin)
  fastify.get("/dashboard/:lojaId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.getDashboard.bind(pedidoController),
  });

  fastify.get("/hoje/:lojaId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.getHoje.bind(pedidoController),
  });

  fastify.get("/faturamento-mes/:lojaId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.getFaturamentoMes.bind(pedidoController),
  });

  fastify.get("/top-produtos/:lojaId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.getTopProdutos.bind(pedidoController),
  });

  fastify.get("/pendentes-envio/:lojaId", {
    preHandler: [rbacMiddleware(["pedidos:read"])],
    handler: pedidoController.getPendentesEnvio.bind(pedidoController),
  });
};
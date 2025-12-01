import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { LojaAvaliacaoController } from "../controllers/loja-avaliacoes.controller.js";
import { LojaAvaliacaoRepository } from "../repositories/loja-avaliacoes.repository.js";
import { LojaAvaliacaoService } from "../services/loja-avaliacoes.service.js";
import LojaRepository from "@/modules/lojas/repositories/loja.repository.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import { PedidoRepository } from "@/modules/pedidos/repositories/pedido.repository.js";

export const LojaAvaliacaoRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);

  const lojaRepo = new LojaRepository();
  const userRepo = new UserRepository();
  const pedidoRepo = new PedidoRepository();
  const avaliacaoRepo = new LojaAvaliacaoRepository();
  const avaliacaoService = new LojaAvaliacaoService(avaliacaoRepo, lojaRepo, userRepo, pedidoRepo);
  const avaliacaoController = new LojaAvaliacaoController(avaliacaoService);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:create"])],
    handler: avaliacaoController.create.bind(avaliacaoController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:read"])],
    handler: avaliacaoController.getAll.bind(avaliacaoController),
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:read"])],
    handler: avaliacaoController.findById.bind(avaliacaoController),
  });

  fastify.get("/loja/:lojaId/media", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:read"])],
    handler: avaliacaoController.getMedia.bind(avaliacaoController),
  });

  fastify.post("/:id/responder", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:respond"])],
    handler: avaliacaoController.responder.bind(avaliacaoController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:update"])],
    handler: avaliacaoController.update.bind(avaliacaoController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["loja_avaliacoes:delete"])],
    handler: avaliacaoController.delete.bind(avaliacaoController),
  });
};
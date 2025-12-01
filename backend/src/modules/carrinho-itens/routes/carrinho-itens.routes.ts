import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { CarrinhoItemController } from "../controllers/carrinho-itens.controller.js";
import { CarrinhoItemRepository } from "../repositories/carrinho-itens.repository.js";
import { CarrinhoItemService } from "../services/carrinho-itens.service.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import { ProdutoRepository } from "@/modules/produtos/repositories/produto.repository.js";
import { ProdutoVariacaoRepository } from "@/modules/produtos/repositories/produto-variacao.repository.js";

export const CarrinhoItemRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const userRepository = new UserRepository();
  const produtoRepository = new ProdutoRepository();
  const produtoVariacaoRepository = new ProdutoVariacaoRepository();
  const carrinhoItemRepository = new CarrinhoItemRepository();
  const carrinhoItemService = new CarrinhoItemService(
    carrinhoItemRepository,
    userRepository,
    produtoRepository,
    produtoVariacaoRepository
  );
  const carrinhoItemController = new CarrinhoItemController(carrinhoItemService);

  fastify.addHook("preHandler", authMiddleware);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["carrinho_itens:add"])],
    handler: carrinhoItemController.create.bind(carrinhoItemController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["carrinho_itens:read"])],
    handler: carrinhoItemController.getAll.bind(carrinhoItemController),
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["carrinho_itens:read"])],
    handler: carrinhoItemController.findById.bind(carrinhoItemController),
  });

  fastify.get("/user", {
    preHandler: [rbacMiddleware(["carrinho_itens:read"])],
    handler: carrinhoItemController.findByUserId.bind(carrinhoItemController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["carrinho_itens:update"])],
    handler: carrinhoItemController.update.bind(carrinhoItemController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["carrinho_itens:remove"])],
    handler: carrinhoItemController.delete.bind(carrinhoItemController),
  });
};
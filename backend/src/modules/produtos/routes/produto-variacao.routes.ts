import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { ProdutoVariacaoController } from "../controllers/produto-variacao.controller.js";
import { ProdutoVariacaoRepository } from "../repositories/produto-variacao.repository.js";
import { ProdutoVariacaoService } from "../services/produto-variacao.service.js";
import { ProdutoRepository } from "../repositories/produto.repository.js";

export const ProdutoVariacaoRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  fastify.addHook("preHandler", authMiddleware);

  const produtoRepository = new ProdutoRepository();
  const produtoVariacaoRepository = new ProdutoVariacaoRepository();
  const produtoVariacaoService = new ProdutoVariacaoService(
    produtoVariacaoRepository,
    produtoRepository
  );
  const produtoVariacaoController = new ProdutoVariacaoController(produtoVariacaoService);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["produto_variacoes:create"])],
    handler: produtoVariacaoController.create.bind(produtoVariacaoController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["produto_variacoes:read"])],
    handler: produtoVariacaoController.getAll.bind(produtoVariacaoController),
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["produto_variacoes:read"])],
    handler: produtoVariacaoController.findById.bind(produtoVariacaoController),
  });

  fastify.get("/produto/:produtoId", {
    preHandler: [rbacMiddleware(["produto_variacoes:read"])],
    handler: produtoVariacaoController.findByProdutoId.bind(produtoVariacaoController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["produto_variacoes:update"])],
    handler: produtoVariacaoController.update.bind(produtoVariacaoController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["produto_variacoes:delete"])],
    handler: produtoVariacaoController.delete.bind(produtoVariacaoController),
  });
};
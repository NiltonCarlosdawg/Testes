import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { CategoriaRepository } from "../repositories/categoria.repository.js";
import { CategoriaService } from "../services/categoria.service.js";
import { CategoriaController } from "../controllers/categoria.controller.js";

export const CategoriaRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const categoriaRepository = new CategoriaRepository();
  const categoriaService = new CategoriaService(categoriaRepository);
  const categoriaController = new CategoriaController(categoriaService);

  fastify.post("/", {
    preHandler: [authMiddleware, rbacMiddleware(["categorias:create"])],
    handler: categoriaController.create.bind(categoriaController),
  });

  fastify.get("/", {
    handler: categoriaController.getAll.bind(categoriaController),
  });

  fastify.get("/:id", {
    preHandler: [authMiddleware, rbacMiddleware(["categorias:read"])],
    handler: categoriaController.findById.bind(categoriaController),
  });

  fastify.put("/:id", {
    preHandler: [authMiddleware, rbacMiddleware(["categorias:update"])],
    handler: categoriaController.update.bind(categoriaController),
  });

  fastify.delete("/:id", {
    preHandler: [authMiddleware, rbacMiddleware(["categorias:delete"])],
    handler: categoriaController.delete.bind(categoriaController),
  });
};

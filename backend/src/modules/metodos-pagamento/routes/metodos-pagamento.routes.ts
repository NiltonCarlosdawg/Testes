import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authResultHook } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import db from "@/config/database.js";
import { CacheService } from "@/config/cache.js";
import { createMetodoPagamentoRepository } from "../repositories/metodos-pagamento.repository.js";
import { createMetodoPagamentoService } from "../services/metodos-pagamento.service.js";
import { createMetodoPagamentoController } from "../controllers/metodos-pagamento.controller.js";

export const MetodosPagamentoRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authResultHook);

  const repository = createMetodoPagamentoRepository(db);
  const service = createMetodoPagamentoService({ repository, cache: CacheService });
  const controller = createMetodoPagamentoController(service);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["metodos_pagamento:create"])],
    handler: controller.create,
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["metodos_pagamento:read"])],
    handler: controller.getAll,
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["metodos_pagamento:read"])],
    handler: controller.findById,
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["metodos_pagamento:update"])],
    handler: controller.update,
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["metodos_pagamento:delete"])],
    handler: controller.delete,
  });
};
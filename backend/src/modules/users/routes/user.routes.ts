import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { UserController } from "@/modules/users/controllers/user.controller.js";
import { UserRepository } from "@/modules/users/repositories/user.repository.js"; 

export const UserRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const userRepository = new UserRepository(); 
  const userController = new UserController(userRepository);

  fastify.addHook("preHandler", authMiddleware);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["users:create"])],
    handler: userController.create.bind(userController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["users:read"])],
    handler: userController.getAll.bind(userController),
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["users:read"])],
    handler: userController.findById.bind(userController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["users:update"])],
    handler: userController.update.bind(userController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["users:delete"])],
    handler: userController.delete.bind(userController),
  });
};
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { rbacMiddleware } from "@/middleware/rbac.middleware.js";
import { RoleController } from "@/modules/roles/controllers/role.controller.js";
import { RoleRepository } from "@/modules/roles/repositories/role.repository.js";
import RoleService from "../services/role.service.js";

export const RoleRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const roleRepository = new RoleRepository();
  const roleController = new RoleController(new RoleService(roleRepository));

  fastify.addHook("preHandler", authMiddleware);

  fastify.post("/", {
    preHandler: [rbacMiddleware(["roles:create"])],
    handler: roleController.create.bind(roleController),
  });

  fastify.get("/", {
    preHandler: [rbacMiddleware(["roles:read"])],
    handler: roleController.findAll.bind(roleController),
  });

  fastify.get("/without", {
    preHandler: [rbacMiddleware(["roles:read"])],
    handler: roleController.findAllWithoutPermissions.bind(roleController),
  });

  // fastify.get("/permissions/template", {
  //   preHandler: [rbacMiddleware(["roles:read"])],
  //   handler: roleController.getPermissionsTemplate.bind(roleController),
  // });

  fastify.get("/:id", {
    preHandler: [rbacMiddleware(["roles:read"])],
    handler: roleController.findById.bind(roleController),
  });

  fastify.get("/:id/permissions", {
    preHandler: [rbacMiddleware(["roles:read"])],
    handler: roleController.getRolePermissions.bind(roleController),
  });

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(["roles:update"])],
    handler: roleController.update.bind(roleController),
  });

  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(["roles:delete"])],
    handler: roleController.delete.bind(roleController),
  });
};
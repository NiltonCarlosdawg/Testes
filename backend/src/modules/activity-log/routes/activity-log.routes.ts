import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authResultHook } from "@/middleware/auth.middleware.js";
import { rbacMiddlewareResult } from "@/middleware/rbac.middleware.js";
import db from "@/config/database.js";
import { CacheService } from "@/config/cache.js";
import { createActivityLogRepository } from "../repositories/activity-log.repository.js";
import { createActivityLogService } from "../services/activity-log.service.js";
import { createActivityLogController } from "../controllers/activity-log.controller.js";
import { UserRepository } from "@/modules/users/repositories/user.repository.js";

export const ActivityLogRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authResultHook);

  const activityLogRepository = createActivityLogRepository(db);
  const userRepository = new UserRepository();

  const activityLogService = createActivityLogService({
    repository: activityLogRepository,
    userRepository,
    cache: CacheService,
  });

  const activityLogController = createActivityLogController(activityLogService);
  fastify.get("/", {
    preHandler: [rbacMiddlewareResult(["activity_logs:read"])],
    handler: activityLogController.getAll,
  });

  fastify.get("/stats", {
    preHandler: [rbacMiddlewareResult(["activity_logs:read"])],
    handler: activityLogController.getStats,
  });

  fastify.get("/:id", {
    preHandler: [rbacMiddlewareResult(["activity_logs:read"])],
    handler: activityLogController.findById,
  });

  fastify.get("/user/:userId", {
    preHandler: [rbacMiddlewareResult(["activity_logs:read"])],
    handler: activityLogController.findByUserId,
  });

  fastify.get("/session/:sessionId", {
    preHandler: [rbacMiddlewareResult(["activity_logs:read"])],
    handler: activityLogController.findBySessionId,
  });

  fastify.get("/entity/:entityType/:entityId", {
    preHandler: [rbacMiddlewareResult(["activity_logs:read"])],
    handler: activityLogController.findByEntity,
  });
};
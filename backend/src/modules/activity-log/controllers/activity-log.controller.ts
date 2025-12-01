import { FastifyRequest } from "fastify";
import { TActivityLogQueryRequest } from "../schemas/activity-log.schema.js";
import { ActivityLogService, EntityType } from "../types/activity-log.types.js";
import { handler } from "@/utils/handler.js";

export const createActivityLogController = (service: ActivityLogService) => ({
  
  // GET /:id
  findById: handler(async (request: FastifyRequest<{ Params: { id: string } }>) => {
    return service.findById(request.params.id);
  }),

  // GET /user/:userId
  findByUserId: handler(async (request: FastifyRequest<{ Params: { userId: string } }>) => {
    return service.findByUserId(request.params.userId);
  }),

  // GET /session/:sessionId
  findBySessionId: handler(async (request: FastifyRequest<{ Params: { sessionId: string } }>) => {
    return service.findBySessionId(request.params.sessionId);
  }),

  // GET /entity/:entityType/:entityId
  findByEntity: handler(async (request: FastifyRequest<{ Params: { entityType: EntityType; entityId: string } }>) => {
    return service.findByEntity(request.params.entityType, request.params.entityId);
  }),

  // GET /
  getAll: handler(async (request: FastifyRequest<{ Querystring: TActivityLogQueryRequest }>) => {
    return service.getAll(request.query);
  }),

  // GET /stats
  getStats: handler(async (request: FastifyRequest<{ Querystring: { startDate?: string; endDate?: string; userId?: string } }>) => {
    return service.getStats(request.query);
  }),
});
import { FastifyRequest } from "fastify";
import { TCreateNotificacaoInput } from "../schemas/notification.schema.js";
import { NotificacaoService, TNotificacaoQueryRequest } from "../types/notification.types.js";
import { Ok } from "@/utils/result.js";
import { handler } from "@/utils/handler.js";

export const createNotificacaoController = (service: NotificacaoService) => ({
  create: handler(
    async (
      request: FastifyRequest<{ Body: TCreateNotificacaoInput }>,
      reply
    ) => {
      const result = await service.create(request.body);

      if (result.success) {
        reply.code(201);
        return Ok({
          status: "success",
          message: "Notificação criada com sucesso",
          data: { id: result.value },
        });
      }

      return result;
    }
  ),

  findById: handler(
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const { userId } = request.user!;
      return service.findById(request.params.id, userId);
    }
  ),

  findByUserId: handler(
    async (
      request: FastifyRequest<{ Querystring: Omit<TNotificacaoQueryRequest, 'userId' > }>
    ) => {
      const { userId } = request.user!;
      const query: TNotificacaoQueryRequest = {
        ...request.query,
        userId, 
      };
      return service.findByUserId(query);
    }
  ),
  
  getUnreadCount: handler(
    async (request: FastifyRequest) => {
      const { userId } = request.user!;
      return service.getUnreadCount(userId);
    }
  ),
  markAsRead: handler(
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply
    ) => {
      const { userId } = request.user!;
      const result = await service.markAsRead(request.params.id, userId);

      if (result.success) {
        reply.code(200);
        return Ok({
          status: "success",
          message: "Notificação marcada como lida",
          data: result.value,
        });
      }

      return result;
    }
  ),
  
  markAllAsRead: handler(
    async (request: FastifyRequest, reply) => {
      const { userId } = request.user!;
      const result = await service.markAllAsRead(userId);

      if (result.success) {
        reply.code(200);
        return Ok({
          status: "success",
          message: `${result.value.count} notificações marcadas como lidas`,
          data: result.value,
        });
      }

      return result;
    }
  ),
});
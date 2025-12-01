import { FastifyRequest } from "fastify";
import { TCreateMetodoPagamentoInput, TUpdateMetodoPagamentoInput } from "../schemas/metodos-pagamento.schema.js";
import { MetodoPagamentoService, TMetodoPagamentoQueryRequest } from "../types/metodos-pagamento.types.js";
import { Ok } from "@/utils/result.js";
import { handler } from "@/utils/handler.js";

export const createMetodoPagamentoController = (service: MetodoPagamentoService) => ({
  create: handler(async (request: FastifyRequest<{ Body: TCreateMetodoPagamentoInput }>, reply) => {
    const result = await service.create(request.body);
    if (result.success) {
      reply.code(201);
      return Ok({ status: "success", message: "Método de pagamento criado", data: { id: result.value } });
    }
    return result;
  }),

  findById: handler(async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const result = await service.findById(request.params.id);
    if (result.success) return Ok({ status: "success", data: result.value });
    return result;
  }),

  getAll: handler(async (request: FastifyRequest<{ Querystring: TMetodoPagamentoQueryRequest }>) => {
    const result = await service.findAll(request.query);
    if (result.success) return Ok({ status: "success", ...result.value });
    return result;
  }),

  update: handler(async (request: FastifyRequest<{ Params: { id: string }; Body: TUpdateMetodoPagamentoInput }>) => {
    const result = await service.update(request.params.id, request.body);
    if (result.success) return Ok({ status: "success", message: "Método de pagamento atualizado", data: result.value });
    return result;
  }),

  delete: handler(async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const result = await service.delete(request.params.id);
    if (result.success) reply.code(204).send();
    return result;
  }),
});
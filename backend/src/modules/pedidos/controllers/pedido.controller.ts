import { FastifyReply, FastifyRequest } from "fastify";
import { TCreatePedidoInput, TUpdatePedidoInput, TUpdatePedidoStatusInput } from "../schemas/pedido.schema.js";
import { PedidoService } from "../services/pedido.service.js";
import { TQueryRequest } from "@/types/query.types.js";
import { UnauthorizedException } from "@/utils/domain.js";

export class PedidoController {
  private service: PedidoService;

  constructor(service: PedidoService) {
    this.service = service;
  }

  async create(request: FastifyRequest<{ Body: TCreatePedidoInput }>, reply: FastifyReply) {
    const pedidoId = await this.service.create(request.body);
    return reply.code(201).send({
      status: "success",
      message: "Pedido criado com sucesso",
      data: { id: pedidoId },
    });
  }

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const item = await this.service.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: item,
    });
  }

  async findByCompradorId(request: FastifyRequest<{ Params: { compradorId: string } }>, reply: FastifyReply) {
    const items = await this.service.findByCompradorId(request.params.compradorId);
    return reply.code(200).send({
      status: "success",
      data: items,
    });
  }
  
  async findByLojaId(request: FastifyRequest<{ Params: { lojaId: string }; Querystring: TQueryRequest }>, reply: FastifyReply) {
    const result = await this.service.findByLojaId(request.params.lojaId, request.query);
    return reply.code(200).send({
      status: "success",
      ...result,
    });
  }

  async getAll(request: FastifyRequest<{ Querystring: TQueryRequest }>, reply: FastifyReply) {
    const result = await this.service.getAll(request.query);
    return reply.code(200).send({
      status: "success",
      ...result,
    });
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: TUpdatePedidoInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    const item = await this.service.update(request.params.id, request.body, userId);
    return reply.code(200).send({
      status: "success",
      message: "Pedido atualizado com sucesso",
      data: item,
    });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    await this.service.delete(request.params.id, userId); // Trata como cancelamento
    return reply.code(204).send();
  }
  
  // --- Controladores Customizados ---
  
  async updateStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: TUpdatePedidoStatusInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    const item = await this.service.updateStatus(request.params.id, request.body, userId);
    return reply.code(200).send({
      status: "success",
      message: "Status do pedido atualizado",
      data: item,
    });
  }

  async cancel(
    request: FastifyRequest<{ Params: { id: string }; Body: { motivo: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    const item = await this.service.cancel(request.params.id, request.body.motivo, userId);
    return reply.code(200).send({
      status: "success",
      message: "Pedido cancelado com sucesso",
      data: item,
    });
  }

  async getHoje(
    request: FastifyRequest<{ Params: { lojaId: string }; Querystring: TQueryRequest }>,
    reply: FastifyReply
  ) {
    const result = await this.service.getHoje(request.params.lojaId, request.query);
    return reply.code(200).send({ status: "success", ...result });
  }

  async getPendentesEnvio(
    request: FastifyRequest<{ Params: { lojaId: string }; Querystring: TQueryRequest }>,
    reply: FastifyReply
  ) {
    const result = await this.service.getPendentesEnvio(request.params.lojaId, request.query);
    return reply.code(200).send({ status: "success", ...result });
  }

  async getDashboard(
    request: FastifyRequest<{ Params: { lojaId: string } }>,
    reply: FastifyReply
  ) {
    const data = await this.service.getDashboard(request.params.lojaId);
    return reply.code(200).send({ status: "success", data });
  }

  async getFaturamentoMes(
    request: FastifyRequest<{ Params: { lojaId: string } }>,
    reply: FastifyReply
  ) {
    const data = await this.service.getFaturamentoMes(request.params.lojaId);
    return reply.code(200).send({ status: "success", data });
  }

  async getTopProdutos(
    request: FastifyRequest<{ Params: { lojaId: string } }>,
    reply: FastifyReply
  ) {
    const data = await this.service.getTopProdutos(request.params.lojaId);
    return reply.code(200).send({ status: "success", data });
  }
}
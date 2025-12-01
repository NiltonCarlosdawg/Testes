import { FastifyReply, FastifyRequest } from "fastify";
import { TCreateLojaInput, TUpdateLojaInput } from "../schemas/loja.schema.js";
import { LojaService } from "../services/loja.service.js";
import { TQueryRequest } from "@/types/query.types.js";
import { UnauthorizedException } from "@/utils/domain.js";

export class LojaController {
  private service: LojaService;

  constructor(service: LojaService) {
    this.service = service;
  }

  async create(request: FastifyRequest<{ Body: TCreateLojaInput }>, reply: FastifyReply) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    const lojaId = await this.service.create(request.body, userId);
    return reply.code(201).send({
      status: "success",
      message: "Loja criada com sucesso",
      data: { id: lojaId },
    });
  }

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const loja = await this.service.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: loja,
    });
  }

  async findByDonoId(request: FastifyRequest<{ Params: { donoId: string } }>, reply: FastifyReply) {
    const lojas = await this.service.findByDonoId(request.params.donoId);
    return reply.code(200).send({
      status: "success",
      data: lojas,
    });
  }

  async getAll(request: FastifyRequest<{ Querystring: TQueryRequest & { status?: string } }>, reply: FastifyReply) {
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;
    const search = request.query.search;
    const status = request.query.status;
    const result = await this.service.getAll(page, limit, search, status);
    return reply.code(200).send({ status: "success", ...result });
  }

  async aprovarLoja(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException("Rota não autenticada");
    }

    const loja = await this.service.aprovarLoja(request.params.id, userId);
    
    return reply.code(200).send({
      status: "success",
      message: "Loja aprovada com sucesso",
      data: loja,
    });
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: TUpdateLojaInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    const loja = await this.service.update(request.params.id, request.body, userId);
    return reply.code(200).send({
      status: "success",
      message: "Loja atualizada com sucesso",
      data: loja,
    });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException("Rota nao autenticada")
    }
    await this.service.delete(request.params.id, userId);
    return reply.code(204).send({})
  }
}

export default LojaController;
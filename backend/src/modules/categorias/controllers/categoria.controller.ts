import { FastifyReply, FastifyRequest } from "fastify";
import { CategoriaService } from "../services/categoria.service.js";
import { TCreateCategoriaInput, TUpdateCategoriaInput } from "../schemas/categoria.schema.js";
import { TIdParam, TQueryRequest } from "@/types/query.types.js";

export class CategoriaController {
  constructor(private service: CategoriaService){}

  async create(
    request: FastifyRequest<{ Body: TCreateCategoriaInput }>,
    reply: FastifyReply
  ){
    const result = await this.service.create(request.body)
    return reply.code(201).send({
      status:"success",
      message: "Categoria Criada com sucesso",
      data: result
    })
  }

  async findById(
    request: FastifyRequest<{ Params: TIdParam }>,
    reply: FastifyReply
  ) {
    const result = await this.service.findById(request.params.id)
    return reply.code(200).send({
      status:"success",
      data: result 
    })
  }

  async getAll(
    request: FastifyRequest<{ Querystring: TQueryRequest }>,
    reply: FastifyReply
  ){
    const { page, limit, search } = request.query
    const result = await this.service.getAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search
    })
    return reply.code(200).send({
      status:"success",
      ...result
    })
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: TUpdateCategoriaInput }>,
    reply: FastifyReply
  ) {
    const categoria = await this.service.update(request.params.id, request.body);
    return reply.code(200).send({
      status: "success",
      message: "Categoria atualizada com sucesso",
      data: categoria,
    });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.delete(request.params.id);
    return reply.code(204).send({})
  }
}
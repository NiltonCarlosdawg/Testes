import { FastifyReply, FastifyRequest } from "fastify";
import { TCreateProdutoVariacaoInput, TUpdateProdutoVariacaoInput } from "../schemas/produto-variacao.schema.js";
import { ProdutoVariacaoService } from "../services/produto-variacao.service.js";
import { TQueryRequest } from "@/types/query.types.js";

export class ProdutoVariacaoController {
  private service: ProdutoVariacaoService;

  constructor(service: ProdutoVariacaoService) {
    this.service = service;
  }

  async create(
    request: FastifyRequest<{ Body: TCreateProdutoVariacaoInput }>,
    reply: FastifyReply
  ) {
    const variacaoId = await this.service.create(request.body);
    return reply.code(201).send({
      status: "success",
      message: "Variação do produto criada com sucesso",
      data: { id: variacaoId },
    });
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const item = await this.service.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: item,
    });
  }

  async findByProdutoId(
    request: FastifyRequest<{ Params: { produtoId: string } }>,
    reply: FastifyReply
  ) {
    const items = await this.service.findByProdutoId(request.params.produtoId);
    return reply.code(200).send({
      status: "success",
      data: items,
    });
  }

  async getAll(
    request: FastifyRequest<{ Querystring: TQueryRequest }>,
    reply: FastifyReply
  ) {
    const result = await this.service.getAll(request.query);
    return reply.code(200).send({
      status: "success",
      ...result,
    });
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TUpdateProdutoVariacaoInput;
    }>,
    reply: FastifyReply
  ) {
    const item = await this.service.update(request.params.id, request.body);
    return reply.code(200).send({
      status: "success",
      message: "Variação do produto atualizada com sucesso",
      data: item,
    });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await this.service.delete(request.params.id);
    return reply.code(204).send();
  }
}

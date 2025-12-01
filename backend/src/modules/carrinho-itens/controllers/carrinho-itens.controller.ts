import { FastifyReply, FastifyRequest } from "fastify";
import {
  TCreateCarrinhoItemInput,
  TUpdateCarrinhoItemInput,
} from "../schemas/carrinho-itens.schema.js";
import { CarrinhoItemService } from "../services/carrinho-itens.service.js";
import { TQueryRequest } from "@/types/query.types.js";
import { UnauthorizedException } from "@/utils/domain.js";

export class CarrinhoItemController {
  private service: CarrinhoItemService;

  constructor(service: CarrinhoItemService) {
    this.service = service;
  }

  async create(
    request: FastifyRequest<{ Body: TCreateCarrinhoItemInput }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.userId
    if(!userId){
      throw new UnauthorizedException('Usuário não autenticado');
    }
    const itemId = await this.service.create({ ...request.body, userId});
    return reply.code(201).send({
      status: "success",
      message: "Item adicionado/atualizado no carrinho com sucesso",
      data: { id: itemId },
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

  async findByUserId(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.userId;
    if(!userId){
      throw new UnauthorizedException("Usuário não autenticado");
    }

    const items = await this.service.findByUserIdWithProducts(userId);
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
      Body: TUpdateCarrinhoItemInput;
    }>,
    reply: FastifyReply
  ) {
    const item = await this.service.update(request.params.id, request.body);
    return reply.code(200).send({
      status: "success",
      message: "Quantidade do item atualizada com sucesso",
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

import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/user.service.js";
import { TCreateUserInput, TUpdateUserInput } from "../schemas/user.schema.js";
import { IUserRepository } from "../types/user.types.js";
import { TQueryRequest } from "@/types/query.types.js";

export class UserController {
  private service: UserService;

  constructor(repository: IUserRepository) {
    this.service = new UserService(repository);
  }

  async create(
    request: FastifyRequest<{ Body: TCreateUserInput }>,
    reply: FastifyReply
  ) {
    const userID = await this.service.create(request.body);
    return reply.code(201).send({
      status: "success",
      message: "Usuário criado com sucesso",
      data: { id: userID },
    });
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: user,
    });
  }

  async getAll(
    request: FastifyRequest<{ Querystring: TQueryRequest }>,
    reply: FastifyReply
  ) {
    const page = request.query.page ? Number(request.query.page) : 1;
    const limit = request.query.limit ? Number(request.query.limit) : 10;
    const search = request.query.search;
    const result = await this.service.getAll(page, limit, search);
    return reply.code(200).send({
      status: "success",
      ...result,
    });
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: TUpdateUserInput }>,
    reply: FastifyReply
  ) {
    const user = await this.service.update(request.params.id, request.body);
    return reply.code(200).send({
      status: "success",
      message: "Usuário atualizado com sucesso",
      data: user,
    });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await this.service.delete(request.params.id);
    return reply.code(200).send({
      status: "success",
      message: "Usuário deletado com sucesso",
    });
  }
}

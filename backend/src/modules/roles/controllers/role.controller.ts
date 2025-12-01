import { FastifyReply, FastifyRequest } from "fastify";
import { CreateRoleInput, UpdateRoleInput } from "../schemas/role.schema.js";
import { RoleService } from "../services/role.service.js";
import { TIdParam, TQueryRequest } from "@/types/query.types.js";
import RoleRepository from "../repositories/role.repository.js";

export class RoleController {
  private service: RoleService;

  constructor(service: RoleService) {
    this.service = service;
  }

  async create(request: FastifyRequest<{ Body: CreateRoleInput }>, reply: FastifyReply) {
    const id = await this.service.create(request.body);
    return reply.code(201).send({
      status: "success",
      message: "Role criada com sucesso",
      data: { id },
    });
  }

  async findById(request: FastifyRequest<{ Params: TIdParam }>, reply: FastifyReply) {
    const role = await this.service.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: role,
    });
  }

  async findAll(request: FastifyRequest<{ Querystring: TQueryRequest }>, reply: FastifyReply) {
    const { page, limit, search } = request.query;
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;
    const response = await this.service.findAll({ page: pageNumber, limit: limitNumber, search: search ?? "" });
    return reply.code(200).send({
      status: "success",
      ...response,
    });
  }

  async findAllWithoutPermissions(request: FastifyRequest<{ Querystring: TQueryRequest }>, reply: FastifyReply) {
    const { page, limit, search } = request.query;
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;
    const response = await this.service.findAllWithoutPermissions({ page: pageNumber, limit: limitNumber, search: search ?? "" });
    return reply.code(200).send({
      status: "success",
      ...response,
    });
  }

  async update(request: FastifyRequest<{ Params: TIdParam; Body: UpdateRoleInput }>, reply: FastifyReply) {
    const role = await this.service.update({ id: request.params.id, data: request.body });
    return reply.code(200).send({
      status: "success",
      message: "Role atualizada com sucesso",
      data: role,
    });
  }

  async delete(request: FastifyRequest<{ Params: TIdParam }>, reply: FastifyReply) {
    await this.service.delete(request.params.id);
    return reply.code(200).send({
      status: "success",
      message: "Role deletada com sucesso",
    });
  }

  async getPermissionsTemplate(reply: FastifyReply) {
    const template = await this.service.getPermissionsTemplate();
    const groupedPermissions = template.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      (acc[perm.category] ?? []).push({
        key: perm.key,
        name: perm.name,
        allowed: perm.allowed,
      });
      return acc;
    }, {} as Record<string, { key: string; name: string; allowed: boolean }[]>);

    return reply.code(200).send({
      status: "success",
      data: groupedPermissions,
    });
  }

  async getRolePermissions(request: FastifyRequest<{ Params: TIdParam }>, reply: FastifyReply) {
    const permissions = await this.service.getCompleteRolePermissions(request.params.id);
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      (acc[perm.category] ?? []).push({
        key: perm.key,
        name: perm.name,
        allowed: perm.allowed,
      });
      return acc;
    }, {} as Record<string, { key: string; name: string; allowed: boolean }[]>);

    return reply.code(200).send({
      status: "success",
      data: groupedPermissions,
    });
  }
}

export default new RoleController(new RoleService(new RoleRepository()));
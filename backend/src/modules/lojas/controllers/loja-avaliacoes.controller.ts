import { FastifyReply, FastifyRequest } from "fastify";
import { TCreateLojaAvaliacaoInput, TResponderAvaliacaoInput } from "../schemas/loja-avaliacoes.schema.js";
import { LojaAvaliacaoService } from "../services/loja-avaliacoes.service.js";
import { TQueryRequest } from "@/types/query.types.js";

export class LojaAvaliacaoController {
  private service: LojaAvaliacaoService;

  constructor(service: LojaAvaliacaoService) {
    this.service = service;
  }

  async create(req: FastifyRequest<{ Body: TCreateLojaAvaliacaoInput }>, reply: FastifyReply) {
    const id = await this.service.create(req.body);
    return reply.code(201).send({ status: "success", message: "Avaliação criada", data: { id } });
  }

  async findById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = await this.service.findById(req.params.id);
    return reply.send({ status: "success", data });
  }

  async getAll(req: FastifyRequest<{ Querystring: TQueryRequest }>, reply: FastifyReply) {
    const result = await this.service.getAll(req.query);
    return reply.send({ status: "success", ...result });
  }

  async getMedia(req: FastifyRequest<{ Params: { lojaId: string } }>, reply: FastifyReply) {
    const media = await this.service.getMediaNota(req.params.lojaId);
    return reply.send({ status: "success", data: { media } });
  }

  async responder(req: FastifyRequest<{ Params: { id: string }; Body: TResponderAvaliacaoInput }>, reply: FastifyReply) {
    const data = await this.service.responder(req.params.id, req.body);
    return reply.send({ status: "success", message: "Resposta enviada", data });
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
    const data = await this.service.update(req.params.id, req.body);
    return reply.send({ status: "success", message: "Avaliação atualizada", data });
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.delete(req.params.id);
    return reply.code(204).send();
  }
}
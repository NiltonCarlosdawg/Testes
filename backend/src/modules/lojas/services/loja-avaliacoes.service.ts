import { formatZodError } from "@/utils/formatZodError.js";
import { createLojaAvaliacaoSchema, updateLojaAvaliacaoSchema, responderAvaliacaoSchema } from "../schemas/loja-avaliacoes.schema.js";
import { ConflictException, NotFoundException, ValidationException } from "@/utils/domain.js";
import { ILojaAvaliacaoRepository, TLojaAvaliacaoResponse, IFAResponseService, TQueryRequest } from "../types/loja-avaliacoes.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import LojaRepository from "@/modules/lojas/repositories/loja.repository.js";
import UserRepository from "@/modules/users/repositories/user.repository.js";
import { PedidoRepository } from "@/modules/pedidos/repositories/pedido.repository.js";
const COMPONENT = "LojaAvaliacaoService";

export class LojaAvaliacaoService {
  private repository: ILojaAvaliacaoRepository;
  private lojaRepo: LojaRepository;
  private userRepo: UserRepository;
  private pedidoRepo: PedidoRepository;

  constructor(
    repository: ILojaAvaliacaoRepository,
    lojaRepo: LojaRepository,
    userRepo: UserRepository,
    pedidoRepo: PedidoRepository
  ) {
    this.repository = repository;
    this.lojaRepo = lojaRepo;
    this.userRepo = userRepo;
    this.pedidoRepo = pedidoRepo;
  }

  async create(data: any): Promise<string> {
    const validation = createLojaAvaliacaoSchema.safeParse(data);
    if (!validation.success) throw new ValidationException(formatZodError(validation.error), COMPONENT);

    const { lojaId, avaliadorId, pedidoId } = validation.data;

    const loja = await this.lojaRepo.findById(lojaId);
    if (!loja) throw new NotFoundException("Loja não encontrada", COMPONENT);

    const avaliador = await this.userRepo.findById(avaliadorId);
    if (!avaliador) throw new NotFoundException("Avaliador não encontrado", COMPONENT);

    if (pedidoId) {
      const pedido = await this.pedidoRepo.findById(pedidoId);
      if (!pedido) throw new NotFoundException("Pedido não encontrado", COMPONENT);
    }

    const existente = await this.repository.findByPedidoId(pedidoId || "");
    if (existente) throw new ConflictException("Este pedido já foi avaliado", COMPONENT);

    return this.repository.create(validation.data);
  }

  async findById(id: string): Promise<TLojaAvaliacaoResponse> {
    await IdMandatory(id);
    const avaliacao = await this.repository.findById(id);
    if (!avaliacao) throw new NotFoundException("Avaliação não encontrada", COMPONENT);
    return avaliacao;
  }

  async getAll(query: TQueryRequest): Promise<IFAResponseService<TLojaAvaliacaoResponse>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.getAll({ ...query, page, limit });
    return {
      data,
      pagination: { page, limit, totalPages: Math.ceil(total / limit), total },
    };
  }

  async getMediaNota(lojaId: string): Promise<number> {
    await IdMandatory(lojaId);
    return this.repository.getMediaNotaByLojaId(lojaId);
  }

  async responder(id: string, data: any): Promise<TLojaAvaliacaoResponse> {
    await IdMandatory(id);
    const validation = responderAvaliacaoSchema.safeParse(data);
    if (!validation.success) throw new ValidationException(formatZodError(validation.error), COMPONENT);

    const avaliacao = await this.repository.findById(id);
    if (!avaliacao) throw new NotFoundException("Avaliação não encontrada", COMPONENT);
    if (avaliacao.resposta) throw new ConflictException("Avaliação já respondida", COMPONENT);

    return this.repository.responder(id, validation.data.resposta);
  }

  async update(id: string, data: any): Promise<TLojaAvaliacaoResponse> {
    await IdMandatory(id);
    const validation = updateLojaAvaliacaoSchema.safeParse(data);
    if (!validation.success) throw new ValidationException(formatZodError(validation.error), COMPONENT);

    await this.findById(id);
    return this.repository.update({ id, data: validation.data });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
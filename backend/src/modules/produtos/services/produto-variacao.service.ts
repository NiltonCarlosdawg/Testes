import { formatZodError } from "@/utils/formatZodError.js";
import {
  TCreateProdutoVariacaoInput,
  TUpdateProdutoVariacaoInput,
  createProdutoVariacaoSchema,
  updateProdutoVariacaoSchema,
} from "../schemas/produto-variacao.schema.js";
import { NotFoundException, ValidationException } from "@/utils/domain.js";
import {
  IProdutoVariacaoRepository,
  TProdutoVariacaoResponse,
} from "../types/produto-variacao.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import { ProdutoRepository } from "../repositories/produto.repository.js";
import { IFAResponseService, TQueryRequest } from "@/types/query.types.js";

const COMPONENT = "ProdutoVariacaoService";

export class ProdutoVariacaoService {
  private repository: IProdutoVariacaoRepository;
  private produtoRepository: ProdutoRepository; 

  constructor(
    repository: IProdutoVariacaoRepository,
    produtoRepository: ProdutoRepository
  ) {
    this.repository = repository;
    this.produtoRepository = produtoRepository;
  }

  async create(data: TCreateProdutoVariacaoInput): Promise<string> {
    const validation = createProdutoVariacaoSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }
    const produtoExists = await this.produtoRepository.findById(data.produtoId);
    if (!produtoExists) {
      throw new NotFoundException("Produto (pai) não encontrado", COMPONENT);
    }

    return await this.repository.create(data);
  }

  async findById(id: string): Promise<TProdutoVariacaoResponse> {
    await IdMandatory(id);
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException("Variação do produto não encontrada", COMPONENT);
    }
    return item;
  }

  async findByProdutoId(produtoId: string): Promise<TProdutoVariacaoResponse[]> {
    await IdMandatory(produtoId);
    const produtoExists = await this.produtoRepository.findById(produtoId);
    if (!produtoExists) {
      throw new NotFoundException("Produto (pai) não encontrado", COMPONENT);
    }
    return await this.repository.findByProdutoId(produtoId);
  }

  async getAll(
    query: TQueryRequest
  ): Promise<IFAResponseService<TProdutoVariacaoResponse>> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const search = query.search;

    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.getAll({ page, limit, search });
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async update(
    id: string,
    data: TUpdateProdutoVariacaoInput
  ): Promise<TProdutoVariacaoResponse> {
    await IdMandatory(id);

    const validation = updateProdutoVariacaoSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }

    await this.findById(id);

    if (data.produtoId) {
      const produtoExists = await this.produtoRepository.findById(data.produtoId);
      if (!produtoExists) {
        throw new NotFoundException("Novo produto (pai) não encontrado", COMPONENT);
      }
    }

    return await this.repository.update({ id, data });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}

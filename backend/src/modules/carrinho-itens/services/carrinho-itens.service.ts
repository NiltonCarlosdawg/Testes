import { formatZodError } from "@/utils/formatZodError.js";
import {
  TCreateCarrinhoItemInput,
  TUpdateCarrinhoItemInput,
  createCarrinhoItemSchema,
  updateCarrinhoItemSchema,
} from "../schemas/carrinho-itens.schema.js";
import {
  NotFoundException,
  ValidationException,
} from "@/utils/domain.js";
import {
  ICarrinhoItemRepository,
  TCarrinhoItemResponse,
} from "../types/carrinho-itens.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";

import UserRepository from "@/modules/users/repositories/user.repository.js";
import { ProdutoRepository } from "@/modules/produtos/repositories/produto.repository.js";
import { ProdutoVariacaoRepository } from "@/modules/produtos/repositories/produto-variacao.repository.js";
import { IFAResponseService, TQueryRequest } from "@/types/query.types.js";


const COMPONENT = "CarrinhoItemService";

export class CarrinhoItemService {
  private repository: ICarrinhoItemRepository;
  private userRepository: UserRepository;
  private produtoRepository: ProdutoRepository;
  private produtoVariacaoRepository: ProdutoVariacaoRepository;

  constructor(
    repository: ICarrinhoItemRepository,
    userRepository: UserRepository,
    produtoRepository: ProdutoRepository,
    produtoVariacaoRepository: ProdutoVariacaoRepository
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.produtoRepository = produtoRepository;
    this.produtoVariacaoRepository = produtoVariacaoRepository;
  }

  async create(data: TCreateCarrinhoItemInput): Promise<string> {
    const validation = createCarrinhoItemSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }
    const userExists = await this.userRepository.ownerExist(data.userId);
    if (!userExists) {
      throw new NotFoundException("Usuário (comprador) não encontrado", COMPONENT);
    }

    const produtoExists = await this.produtoRepository.findById(data.produtoId);
    if (!produtoExists) {
      throw new NotFoundException("Produto não encontrado", COMPONENT);
    }

    if (data.variacaoId) {
      const variacaoExists = await this.produtoVariacaoRepository.findById(
        data.variacaoId
      );
      if (!variacaoExists) {
        throw new NotFoundException("Variação do produto não encontrada", COMPONENT);
      }
    }

    const existingItem = await this.repository.findByUserProdutoVariacao({
      userId: data.userId,
      produtoId: data.produtoId,
      variacaoId: data.variacaoId || null,
    });

    if (existingItem) {
      const novaQuantidade = existingItem.quantidade + data.quantidade;
      const updatedItem = await this.repository.update({
        id: existingItem.id,
        data: { quantidade: novaQuantidade },
      });
      return updatedItem.id; 
    }

    return await this.repository.create(data);
  }

  async findById(id: string): Promise<TCarrinhoItemResponse> {
    await IdMandatory(id);
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException("Item do carrinho não encontrado", COMPONENT);
    }
    return item;
  }

  async findByUserId(userId: string): Promise<TCarrinhoItemResponse[]> {
    await IdMandatory(userId);
    return await this.repository.findByUserId(userId);
  }

  async findByUserIdWithProducts(userId: string) {
    await IdMandatory(userId);
    return await this.repository.findByUserIdWithProducts(userId);
  }


  async getAll(
    query: TQueryRequest
  ): Promise<IFAResponseService<TCarrinhoItemResponse>> {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const search = query.search;

    validatePaginationParams(page, limit);

    const { data, total } = await this.repository.getAll({
      page,
      limit,
      search,
    });
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
    data: TUpdateCarrinhoItemInput
  ): Promise<TCarrinhoItemResponse> {
    await IdMandatory(id);

    const validation = updateCarrinhoItemSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }
    await this.findById(id);

    return await this.repository.update({ id, data });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); 
    await this.repository.delete(id);
  }
}

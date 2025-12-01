import { TCreateMetodoPagamentoInput, TUpdateMetodoPagamentoInput, createMetodoPagamentoSchema, updateMetodoPagamentoSchema } from "../schemas/metodos-pagamento.schema.js";
import { MetodoPagamentoRepository, TMetodoPagamentoResponse, TMetodoPagamentoQueryRequest, MetodoPagamentoService } from "../types/metodos-pagamento.types.js";
import { IFAResponseService } from "@/types/query.types.js";
import { CacheService } from "@/config/cache.js";
import { Result, Ok, Err, AppError, ErrorFactory } from "@/utils/result.js";
import { formatZodError } from "@/utils/formatZodError.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";

const COMPONENT = "MetodoPagamentoService";

type MetodoPagamentoServiceDeps = {
  repository: MetodoPagamentoRepository;
  cache: typeof CacheService;
};

export const createMetodoPagamentoService = (deps: MetodoPagamentoServiceDeps): MetodoPagamentoService => {
  const { repository, cache } = deps;

  const getCacheKey = (id: string) => `metodo-pagamento:${id}`;
  const getListCacheKey = (query: TMetodoPagamentoQueryRequest) => {
    const { page = 1, limit = 10, search, ativo } = query;
    return `metodos-pagamento:list:${page}:${limit}:${search || 'all'}:${ativo ?? 'all'}`;
  };

  const service: MetodoPagamentoService = {
    create: async (data: TCreateMetodoPagamentoInput): Promise<Result<string, AppError>> => {
      const validation = createMetodoPagamentoSchema.safeParse(data);
      if (!validation.success) {
        return Err(ErrorFactory.validation(formatZodError(validation.error), [], COMPONENT));
      }

      const { codigo } = validation.data;
      const existing = await repository.findByCodigo(codigo);
      if (existing) {
        return Err(ErrorFactory.conflict("Código já está em uso", "codigo", codigo, COMPONENT));
      }

      const id = await repository.create(validation.data);
      await cache.deletePattern("metodos-pagamento:list:*");

      return Ok(id);
    },

    findById: async (id: string): Promise<Result<TMetodoPagamentoResponse, AppError>> => {
      if (!id) return Err(ErrorFactory.validation("ID é obrigatório", COMPONENT));

      const cacheKey = getCacheKey(id);
      const item = await cache.getOrSet(cacheKey, 3600, async () => repository.findById(id));

      if (!item) {
        return Err(ErrorFactory.notFound("Método de pagamento não encontrado", "metodo_pagamento", id, COMPONENT));
      }

      return Ok(item);
    },

    findAll: async (query: TMetodoPagamentoQueryRequest): Promise<Result<IFAResponseService<TMetodoPagamentoResponse>, AppError>> => {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      validatePaginationParams(page, limit);

      const cacheKey = getListCacheKey(query);
      const result = await cache.getOrSet(cacheKey, 60, async () => {
        const { data, total } = await repository.findAll({
          page,
          limit,
          search: query.search,
          ativo: query.ativo,
        });
        return {
          data,
          pagination: { page, limit, totalPages: Math.ceil(total / limit), total },
        };
      });

      return Ok(result);
    },

    update: async (id: string, data: TUpdateMetodoPagamentoInput): Promise<Result<TMetodoPagamentoResponse, AppError>> => {
      const validation = updateMetodoPagamentoSchema.safeParse(data);
      if (!validation.success) {
        return Err(ErrorFactory.validation(formatZodError(validation.error), [], COMPONENT));
      }

      const existing = await service.findById(id);
      if (!existing.success) return existing;

      if (data.codigo && data.codigo !== existing.value.codigo) {
        const conflict = await repository.findByCodigo(data.codigo);
        if (conflict) {
          return Err(ErrorFactory.conflict("Código já está em uso", "codigo", data.codigo, COMPONENT));
        }
      }

      const updated = await repository.update({ id, data: validation.data });
      if (!updated) {
        return Err(ErrorFactory.notFound("Método de pagamento não encontrado para atualização", "metodo_pagamento", id, COMPONENT));
      }

      await cache.invalidate("metodo-pagamento", id);
      await cache.deletePattern("metodos-pagamento:list:*");

      return Ok(updated);
    },

    delete: async (id: string): Promise<Result<void, AppError>> => {
      const inUse = await service.checkIfInUse(id);
      if (inUse) {
        return Err(ErrorFactory.conflict("Método de pagamento está em uso em transações", "metodo_pagamento", id, COMPONENT));
      }

      await repository.delete(id);
      await cache.invalidate("metodo-pagamento", id);
      await cache.deletePattern("metodos-pagamento:list:*");

      return Ok(undefined);
    },

    checkIfInUse: async (id: string): Promise<boolean> => {
      return repository.checkIfInUse(id);
    },
  };

  return service;
};
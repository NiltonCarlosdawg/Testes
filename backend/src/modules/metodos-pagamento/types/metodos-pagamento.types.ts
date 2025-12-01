import { AppError, Result } from "@/utils/result.js";
import { TCreateMetodoPagamentoInput, TUpdateMetodoPagamentoInput } from "../schemas/metodos-pagamento.schema.js";
import { IFAResponseService, TQueryRequest } from "@/types/query.types.js";

export type TMetodoPagamentoDbRow = {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  icone_url: string | null;
  taxa_percentual: string;
  taxa_fixa: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
};

export type TMetodoPagamentoResponse = {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  iconeUrl: string | null;
  taxaPercentual: number;
  taxaFixa: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TMetodoPagamentoQueryRequest = TQueryRequest & {
  ativo?: boolean;
  codigo?: string;
};

export type MetodoPagamentoRepository = {
  create: (data: TCreateMetodoPagamentoInput) => Promise<string>;
  findById: (id: string) => Promise<TMetodoPagamentoResponse | null>;
  findByCodigo: (codigo: string) => Promise<TMetodoPagamentoResponse | null>;
  findAll: (params: {
    page: number;
    limit: number;
    search?: string;
    ativo?: boolean;
  }) => Promise<{ data: TMetodoPagamentoResponse[]; total: number }>;
  update: (params: { id: string; data: TUpdateMetodoPagamentoInput }) => Promise<TMetodoPagamentoResponse | null>;
  delete: (id: string) => Promise<void>;
  checkIfInUse: (id: string) => Promise<boolean>;
};

export type MetodoPagamentoService = {
  create: (data: TCreateMetodoPagamentoInput) => Promise<Result<string, AppError>>;
  findById: (id: string) => Promise<Result<TMetodoPagamentoResponse, AppError>>;
  findAll: (query: TMetodoPagamentoQueryRequest) => Promise<Result<IFAResponseService<TMetodoPagamentoResponse>, AppError>>;
  update: (id: string, data: TUpdateMetodoPagamentoInput) => Promise<Result<TMetodoPagamentoResponse, AppError>>;
  delete: (id: string) => Promise<Result<void, AppError>>;
  checkIfInUse: (id: string) => Promise<boolean>;
};
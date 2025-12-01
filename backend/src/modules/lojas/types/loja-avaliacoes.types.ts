import { TCreateLojaAvaliacaoInput, TUpdateLojaAvaliacaoInput } from "../schemas/loja-avaliacoes.schema.js";

export enum StatusAvaliacao {
  ATIVA = "ativa",
  RESPONDIDA = "respondida",
  INATIVA = "inativa",
}

export type TLojaAvaliacaoDbRow = {
  id: string;
  loja_id: string;
  avaliador_id: string;
  pedido_id: string | null;
  nota: number;
  comentario: string | null;
  resposta: string | null;
  respondido_em: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type TLojaAvaliacaoResponse = {
  id: string;
  lojaId: string;
  avaliadorId: string;
  pedidoId: string | null;
  nota: number;
  comentario: string | null;
  resposta: string | null;
  respondidoEm: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface ILojaAvaliacaoRepository {
  create(data: TCreateLojaAvaliacaoInput): Promise<string>;
  findById(id: string): Promise<TLojaAvaliacaoResponse | null>;
  findByLojaId(lojaId: string): Promise<TLojaAvaliacaoResponse[]>;
  findByAvaliadorId(avaliadorId: string): Promise<TLojaAvaliacaoResponse[]>;
  findByPedidoId(pedidoId: string): Promise<TLojaAvaliacaoResponse | null>;
  getAll(params: TQueryRequest): Promise<{ data: TLojaAvaliacaoResponse[]; total: number }>;
  getMediaNotaByLojaId(lojaId: string): Promise<number>;
  update(params: { id: string; data: TUpdateLojaAvaliacaoInput }): Promise<TLojaAvaliacaoResponse>;
  responder(id: string, resposta: string): Promise<TLojaAvaliacaoResponse>;
  delete(id: string): Promise<void>;
}

export interface IFAResponseService<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export type TQueryRequest = {
  page?: number;
  limit?: number;
  search?: string;
  lojaId?: string;
  avaliadorId?: string;
};

export interface InsertResult { id: string }
export interface CountResult { total: string }
export interface MediaResult { media: string }
import { TQueryRequest,  } from "@/types/query.types.js";
import { TCreateProdutoVariacaoInput, TUpdateProdutoVariacaoInput } from "../schemas/produto-variacao.schema.js";

export type TAtributosVariacao = Record<string, any> | null;

export type TProdutoVariacaoDbRow = {
  id: string;
  produto_id: string;
  nome: string;
  sku: string | null;
  preco_adicional: string | null;
  quantidade_estoque: number; 
  atributos: TAtributosVariacao | string | null; 
  ativo: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

export type TProdutoVariacaoResponse = {
  id: string;
  produtoId: string;
  nome: string;
  sku: string | null;
  precoAdicional: number;
  quantidadeEstoque: number;
  atributos: TAtributosVariacao;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface IProdutoVariacaoRepository {
  create(data: TCreateProdutoVariacaoInput): Promise<string>;
  findById(id: string): Promise<TProdutoVariacaoResponse | null>;
  findByProdutoId(produtoId: string): Promise<TProdutoVariacaoResponse[]>;
  getAll(params: TQueryRequest): Promise<{ data: TProdutoVariacaoResponse[]; total: number }>;
  update(params: { id: string; data: TUpdateProdutoVariacaoInput }): Promise<TProdutoVariacaoResponse>;
  delete(id: string): Promise<void>; 
}

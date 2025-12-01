import { TQueryRequest,  } from "@/types/query.types.js";
import { TCreateCarrinhoItemInput, TUpdateCarrinhoItemInput } from "../schemas/carrinho-itens.schema.js";

export type TCarrinhoItemDbRow = {
  id: string;
  user_id: string;
  produto_id: string;
  variacao_id: string | null;
  quantidade: number; 
  created_at: Date | string;
  updated_at: Date | string;
};

export type TCarrinhoItemResponse = {
  id: string;
  userId: string;
  produtoId: string;
  variacaoId: string | null;
  quantidade: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface TProdutoImagemCarrinho {
  id: string;
  url: string;
  textoAlternativo: string | null;
  posicao: number;
  isPrincipal: boolean;
}

export interface TProdutoCarrinho {
  id: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  precoOriginal: number | null;
  imagens: TProdutoImagemCarrinho[];
}

export interface TVariacaoCarrinho {
  id: string;
  nome: string;
  sku: string | null;
  precoAdicional: number | null;
  quantidadeEstoque: number;
  atributos: Record<string, string>; 
}

export interface TCarrinhoItemWithProductResponse extends TCarrinhoItemResponse {
  produto: TProdutoCarrinho;
  variacao: TVariacaoCarrinho | null;
}



// Interface do Repositório
export interface ICarrinhoItemRepository {
  create(data: TCreateCarrinhoItemInput): Promise<string>;
  findById(id: string): Promise<TCarrinhoItemResponse | null>;
  findByUserId(userId: string): Promise<TCarrinhoItemResponse[]>;
  findByUserIdWithProducts(userId: string): Promise<TCarrinhoItemWithProductResponse[]>;
  findByUserProdutoVariacao(params: {
    userId: string;
    produtoId: string;
    variacaoId: string | null;
  }): Promise<TCarrinhoItemResponse | null>;
  getAll(params: TQueryRequest): Promise<{
    data: TCarrinhoItemResponse[];
    total: number;
  }>;
  update(params: {
    id: string;
    data: TUpdateCarrinhoItemInput;
  }): Promise<TCarrinhoItemResponse>;
  delete(id: string): Promise<void>;
}

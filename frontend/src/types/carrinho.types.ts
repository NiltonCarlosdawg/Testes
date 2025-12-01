export interface CarrinhoItem {
  id: string;
  userId: string;
  produtoId: string;
  variacaoId: string | null;
  quantidade: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  total?: number;
}

export interface CreateCarrinhoItemInput {
  produtoId: string;
  variacaoId?: string | null;
  quantidade: number;
}

export interface UpdateCarrinhoItemInput {
  quantidade: number;
}

export interface TProdutoCarrinho {
  id: string;
  titulo: string;
  slug: string;
  preco: number;
  precoPromocional: number | null;
  descricao?: string | null;
  imagens: TProdutoImagemCarrinho[];
}

export interface TProdutoImagemCarrinho {
  id: string;
  url: string;
  textoAlternativo: string | null;
  posicao: number;
  isPrincipal: boolean;
}

export interface TVariacaoCarrinho {
  id: string;
  cor: string | null;
  tamanho: string | null;
  preco: number | null;
  estoque: number;
}

export interface TCarrinhoItemWithProductResponse extends CarrinhoItem {
  produto: TProdutoCarrinho;
  variacao: TVariacaoCarrinho | null;
}
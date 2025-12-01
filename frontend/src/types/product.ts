// src/types/product.ts

export interface ProductImage {
  id: string;
  url: string;
  posicao: number;
  isPrincipal?: boolean;
}

export interface Product {
  id: string;
  lojaId: string;
  titulo: string;
  descricao: string;
  categoriaId: string;
  preco: number;
  precoOriginal?: number;           // Para promoções
  marca: string;
  modelo: string;
  condicao: string;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  permitePedidoSemEstoque: boolean;
  sku: string;
  codigoBarras: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  imagens: ProductImage[];

  // CAMPOS ADICIONAIS IMPORTANTES (adicionados sem remover nada)
  slug?: string;                            // Para URL amigável: /produto/iphone-15-pro-max-123
  likes?: number;                           // Quantidade de favoritos
  visualizacoes?: number;                   // Contador de views
  vendido?: boolean;                        // Se já foi vendido
  reservado?: boolean;                      // Se está reservado
  destaque?: boolean;                       // Para aparecer em "destaques"
  promocaoAtiva?: boolean;                  // Se tem desconto ativo
  descontoPercentual?: number;              // Ex: 15 = 15% de desconto
  provincia?: string;                       // Província do vendedor
  municipio?: string;                       // Município
  metodoEnvio?: ('entrega' | 'levantamento' | 'ambos')[];
  prazoEntrega?: string;                    // Ex: "1-3 dias úteis"
  garantia?: string;                        // Ex: "3 meses contra defeito de fabrico"
  pesoGramas?: number;                      // Para cálculo de envio
  dimensoes?: {
    comprimento: number;
    largura: number;
    altura: number;
  };
  cor?: string;
  tamanho?: string;
  material?: string;
  tags?: string[];                          // Para busca avançada
  avaliacaoMedia?: number;                  // Média de estrelas (0-5)
  totalAvaliacoes?: number;
  dataPublicacao?: string;                  // Quando foi publicado
  dataExpiracao?: string | null;            // Para anúncios temporários
}

// Resposta completa da API (para paginação, filtros, etc.)
export interface ProductApiResponse {
  status: 'success' | 'error';
  message?: string;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: {
    categorias?: string[];
    precos?: { min: number; max: number };
    condicoes?: string[];
  };
}

// Tipo para uso no frontend (simplificado, se precisares de versão leve)
export type ProductCard = Pick<
  Product,
  | 'id'
  | 'titulo'
  | 'preco'
  | 'precoOriginal'
  | 'condicao'
  | 'imagens'
  | 'likes'
  | 'slug'
  | 'provincia'
  | 'promocaoAtiva'
  | 'descontoPercentual'
>;
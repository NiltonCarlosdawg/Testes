import { TCreateProdutoInput, TUpdateProdutoInput } from "../schemas/produto.schema.js";

export enum CONDICAOPRODUTO {
  NOVO_COM_ETIQUETA = "novo_com_etiqueta",
  NOVO_SEM_ETIQUETA = "novo_sem_etiqueta",
  MUITO_BOM = "muito_bom",
  BOM = "bom",
  ACEITAVEL = "aceitavel",
  USADO = "usado",
  RECONDICIONADO = "recondicionado",
}

export type TProdutoImagemDbRow = {
  id: string;
  produto_id: string;
  url: string;
  texto_alternativo?: string | null;
  posicao: number;
  is_principal: boolean;
};

export type TProdutoImagemResponse = {
  id: string;
  url: string;
  textoAlternativo?: string;
  posicao: number;
  isPrincipal: boolean;
};

export type TProdutoDbRow = {
  id: string;
  loja_id: string;
  titulo: string;
  descricao: string;
  categoria_id?: string | null;
  preco: string;
  preco_original?: string | null;
  marca?: string | null;
  modelo?: string | null;
  condicao: CONDICAOPRODUTO;
  quantidade_estoque: number;
  quantidade_minima?: number | null;
  permite_pedido_sem_estoque?: boolean | null;
  sku?: string | null;
  codigo_barras?: string | null;
  peso_kg?: string | null;
  altura_cm?: string | null;
  largura_cm?: string | null;
  ativo?: boolean | null;

  // NOVOS CAMPOS
  tamanho?: string | null;
  cor?: string | null;
  material?: string | null;
  genero?: string | null;
  idade_grupo?: string | null;
  visualizacoes?: number | null;
  favoritos_count?: number | null;
  vendas_total?: number | null;
  tags?: any; // jsonb
  atributos?: any; // jsonb

  created_at: Date;
  updated_at: Date;
};

export type TProdutoResponse = {
  id: string;
  lojaId: string;
  titulo: string;
  descricao: string;
  categoriaId?: string;
  preco: number;
  precoOriginal?: number;
  marca?: string;
  modelo?: string;
  condicao: CONDICAOPRODUTO;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  permitePedidoSemEstoque: boolean;
  sku?: string;
  codigoBarras?: string;
  pesoKg?: number;
  alturaCm?: number;
  larguraCm?: number;
  ativo: boolean;
  tamanho?: string;
  cor?: string;
  material?: string;
  genero?: string;
  idadeGrupo?: string;
  visualizacoes: number;
  favoritosCount: number;
  vendasTotal: number;
  tags?: string[];
  atributos?: Record<string, string>;

  createdAt: Date;
  updatedAt: Date;
  imagens: TProdutoImagemResponse[];
};

export interface IProdutoRepository {
  create(data: TCreateProdutoInput): Promise<string>;
  findById(id: string): Promise<TProdutoResponse | null>;
  findByLoja(lojaId: string): Promise<TProdutoResponse[]>;
  findByCategoria(categoriaId: string): Promise<TProdutoResponse[]>;
  getAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: TProdutoResponse[]; total: number }>;
  update(id: string, data: TUpdateProdutoInput ): Promise<TProdutoResponse>;
  delete(id: string): Promise<boolean>;
}

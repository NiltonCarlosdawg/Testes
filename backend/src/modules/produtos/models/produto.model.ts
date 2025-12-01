import { CONDICAOPRODUTO, TProdutoDbRow, TProdutoResponse } from "../types/produto.types.js";

export class Produto {
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
  createdAt: Date;
  updatedAt: Date;
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

  constructor(data: TProdutoDbRow) {
    this.id = data.id;
    this.lojaId = data.loja_id;
    this.titulo = data.titulo;
    this.descricao = data.descricao;
    this.categoriaId = data.categoria_id ?? undefined;
    this.preco = Number(data.preco);
    this.precoOriginal = data.preco_original ? Number(data.preco_original) : undefined;
    this.marca = data.marca ?? "";
    this.modelo = data.modelo ?? "";
    this.condicao = data.condicao ?? CONDICAOPRODUTO.NOVO_COM_ETIQUETA;
    this.quantidadeEstoque = data.quantidade_estoque ?? 0;
    this.quantidadeMinima = data.quantidade_minima ?? 1;
    this.permitePedidoSemEstoque = data.permite_pedido_sem_estoque ?? false;
    this.sku = data.sku ?? "";
    this.codigoBarras = data.codigo_barras ?? "";
    this.pesoKg = data.peso_kg ? Number(data.peso_kg) : undefined;
    this.alturaCm = data.altura_cm ? Number(data.altura_cm) : undefined;
    this.larguraCm = data.largura_cm ? Number(data.largura_cm) : undefined;
    this.ativo = data.ativo ?? true;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
    this.tamanho = data.tamanho ?? undefined;
    this.cor = data.cor ?? undefined;
    this.material = data.material ?? undefined;
    this.genero = data.genero ?? undefined;
    this.idadeGrupo = data.idade_grupo ?? undefined;
    this.visualizacoes = data.visualizacoes ?? 0;
    this.favoritosCount = data.favoritos_count ?? 0;
    this.vendasTotal = data.vendas_total ?? 0;
    this.tags = data.tags ? JSON.parse(JSON.stringify(data.tags)) : undefined;
    this.atributos = data.atributos ? JSON.parse(JSON.stringify(data.atributos)) : undefined;
  }

  toJSON(): TProdutoResponse {
    return {
      id: this.id,
      lojaId: this.lojaId,
      titulo: this.titulo,
      descricao: this.descricao,
      categoriaId: this.categoriaId,
      preco: this.preco,
      precoOriginal: this.precoOriginal,
      marca: this.marca,
      modelo: this.modelo,
      condicao: this.condicao,
      quantidadeEstoque: this.quantidadeEstoque,
      quantidadeMinima: this.quantidadeMinima,
      permitePedidoSemEstoque: this.permitePedidoSemEstoque,
      sku: this.sku,
      codigoBarras: this.codigoBarras,
      pesoKg: this.pesoKg,
      alturaCm: this.alturaCm,
      larguraCm: this.larguraCm,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tamanho: this.tamanho,
      cor: this.cor,
      material: this.material,
      genero: this.genero,
      idadeGrupo: this.idadeGrupo,
      visualizacoes: this.visualizacoes,
      favoritosCount: this.favoritosCount,
      vendasTotal: this.vendasTotal,
      tags: this.tags,
      atributos: this.atributos,
      imagens: []
    };
  }
}

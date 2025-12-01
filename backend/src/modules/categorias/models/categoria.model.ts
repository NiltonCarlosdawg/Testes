import { TCategoriaDbRow, TCategoriaResponse } from "../types/categoria.types.js";

export class Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  iconeUrl?: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoriaPaiId?: string;

  constructor(data: TCategoriaDbRow) {
    this.id = data.id;
    this.nome = data.nome;
    this.slug = data.slug;
    this.descricao = data.descricao ?? "";
    this.iconeUrl = data.icone_url ?? "";
    this.ordem = data.ordem ?? 0;
    this.ativo = data.ativo ?? true;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at)
    this.categoriaPaiId = data.categoria_pai_id ?? undefined;
  }

  toJSON(): TCategoriaResponse {
    return {
      id: this.id,
      nome: this.nome,
      slug: this.slug,
      descricao: this.descricao,
      iconeUrl: this.iconeUrl,
      ordem: this.ordem,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      categoriaPaiId: this.categoriaPaiId,
    };
  }
}

import { TCreateCategoriaInput, TUpdateCategoriaInput } from "../schemas/categoria.schema.js";

export type TCategoriaDbRow = {
  id: string;
  nome: string;
  slug: string;
  descricao?: string | null;
  icone_url?: string | null;
  ordem?: number | null;
  ativo?: boolean | null;
  created_at: Date;
  updated_at: Date;
  categoria_pai_id?: string | null;
};

export type TCategoriaResponse = {
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
};

export interface ICategoriaRepository {
  create(data: TCreateCategoriaInput): Promise<string>;
  findById(id: string): Promise<TCategoriaResponse | null>;
  findBySlug(slug: string): Promise<TCategoriaResponse | null>;
  getAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: TCategoriaResponse[]; total: number }>;
  update(id: string, data: TUpdateCategoriaInput ): Promise<TCategoriaResponse>;
  delete(id: string): Promise<boolean>;
}

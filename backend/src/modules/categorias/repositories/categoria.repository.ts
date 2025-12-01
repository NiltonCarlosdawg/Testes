import db from "@/config/database.js";
import { TCreateCategoriaInput, TUpdateCategoriaInput } from "../schemas/categoria.schema.js";
import { Categoria } from "../models/categoria.model.js";
import { ICategoriaRepository, TCategoriaDbRow, TCategoriaResponse } from "../types/categoria.types.js";
import { TFindAllResponse, TQueryRequest } from "@/types/query.types.js";
import { DatabaseException } from "@/utils/domain.js";

export class CategoriaRepository implements ICategoriaRepository{
  private db: typeof db;

  constructor(dbInstance: typeof db = db) {
    this.db = dbInstance;
  }

  async create(data: TCreateCategoriaInput): Promise<string> {
    const query = `INSERT INTO categorias (nome, slug, descricao, icone_url, ordem, ativo, categoria_pai_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;

    const values = [
      data.nome,
      data.slug,
      data.descricao,
      data.iconeUrl,
      data.ordem,
      data.ativo || true,
      data.categoriaPaiId,
    ];
    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  async findBySlug(slug: string): Promise<TCategoriaResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM categorias WHERE slug = $1 AND ativo = true",
      [slug]
    );
    return result.rows[0] ? new Categoria(result.rows[0]).toJSON() : null;
  }

  async findById(id: string): Promise<TCategoriaResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM categorias WHERE id = $1 AND ativo = true",
      [id]
    );
    return result.rows[0] ? new Categoria(result.rows[0]).toJSON() : null;
  }

  async getAll({
    page,
    limit,
    search,
  }: TQueryRequest): Promise<TFindAllResponse<TCategoriaResponse>> {
    const offset = (page - 1) * limit 
    let query = "SELECT * FROM categorias"
    let countQuery = "SELECT COUNT(*) AS total FROM categorias"
    const values: (string | number)[] = [];
    if(search){
      const searchCondition = ` WHERE nome ILIKE $1 OR descricao ILIKE $1 OR ordem::TEXT ILIKE $1`
      query += searchCondition
      countQuery += searchCondition
      const searchParam = `%${search}%`
      values.push(searchParam)
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset)

    const [queryResult, countResult] = await Promise.all([
      db.query(query, values),  
      db.query(countQuery, search ? [values[0]] : []),
    ])

    const data = queryResult.rows.map((row: TCategoriaDbRow)=> new Categoria(row).toJSON())
    const total = parseInt(countResult.rows[0].total, 10)

    return { data, total }
  }

  async update(id: string, data: TUpdateCategoriaInput): Promise<TCategoriaResponse>{
    const fields: string[] = []
    const values: (string | number | boolean)[] = []
    let counter = 1
    const fieldsMapping: Record<string, string> = {
      nome: "nome",
      slug: "slug",
      descricao: "descricao",
      iconeUrl: "icone_url",
      ordem: "ordem",
      categoriaPaiId: "categoria_pai_id"
    }

    for(const [key, value] of Object.entries(data)){
      if(value !== undefined && fieldsMapping[key]){
        fields.push(`${fieldsMapping[key]} = $${counter}`)
        values.push(value)
        counter++
      }
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)
    const query = `
      UPDATE categorias 
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `
    const result = await db.query(query, values)
    if(!result.rows[0]){
      throw new DatabaseException("update failed: categoria not found or no changes made")
    }
    return new Categoria(result.rows[0]).toJSON()
  }

  async delete(id: string): Promise<boolean>{
    const result = await this.db.query("UPDATE categorias SET ativo = false WHERE id = $1", [id])
    return (result.rowCount ?? 0) > 0
  }
}

import db from "@/config/database.js";
import { TCreateProdutoVariacaoInput, TUpdateProdutoVariacaoInput } from "../schemas/produto-variacao.schema.js";
import {
  IProdutoVariacaoRepository,
  TProdutoVariacaoResponse,
} from "../types/produto-variacao.types.js";
import { ProdutoVariacao } from "../models/produto-variacao.model.js";
import { TQueryRequest } from "@/types/query.types.js";

export class ProdutoVariacaoRepository implements IProdutoVariacaoRepository {
  private db: typeof db;

  constructor(dbInstance: typeof db = db) {
    this.db = dbInstance;
  }

  async create(data: TCreateProdutoVariacaoInput): Promise<string> {
    const query = `
      INSERT INTO produto_variacoes (
        produto_id, nome, sku, preco_adicional, quantidade_estoque, atributos, ativo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const values = [
      data.produtoId,
      data.nome,
      data.sku,
      data.precoAdicional,
      data.quantidadeEstoque,
      data.atributos ? JSON.stringify(data.atributos) : null,
      data.ativo,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  async findById(id: string): Promise<TProdutoVariacaoResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM produto_variacoes WHERE id = $1",
      [id]
    );
    return result.rows[0] ? new ProdutoVariacao(result.rows[0]).toJSON() : null;
  }

  async findByProdutoId(produtoId: string): Promise<TProdutoVariacaoResponse[]> {
    const result = await this.db.query(
      "SELECT * FROM produto_variacoes WHERE produto_id = $1 ORDER BY nome ASC",
      [produtoId]
    );
    return result.rows.map((row) => new ProdutoVariacao(row).toJSON());
  }

  async getAll({ page = 1, limit = 10, search }: TQueryRequest): Promise<{ data: TProdutoVariacaoResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM produto_variacoes";
    let countQuery = "SELECT COUNT(*) AS total FROM produto_variacoes";
    const values: (string | number)[] = [];
    const countValues: (string | number)[] = [];

    if (search) {
      const searchClause = ` WHERE nome ILIKE $1 OR sku ILIKE $1`;
      query += searchClause;
      countQuery += searchClause;
      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, values),
      this.db.query(countQuery, countValues),
    ]);

    const data = dataRes.rows.map((row) => new ProdutoVariacao(row).toJSON());
    const total = parseInt(countRes.rows[0].total, 10);

    return { data, total };
  }
  
  
  async update({ id, data }: { id: string; data: TUpdateProdutoVariacaoInput }): Promise<TProdutoVariacaoResponse> {
    const values: (string | number | boolean | Date | object | null | undefined)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      produtoId: "produto_id",
      nome: "nome",
      sku: "sku",
      precoAdicional: "preco_adicional",
      quantidadeEstoque: "quantidade_estoque",
      atributos: "atributos",
      ativo: "ativo",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(key === "atributos" ? JSON.stringify(value) : value);
        counter++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE produto_variacoes
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;
    const result = await this.db.query(query, values);

    if (!result.rows[0]) {
      throw new Error("Falha na atualização: Variação não encontrada ou nenhuma alteração feita");
    }

    return new ProdutoVariacao(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      "UPDATE produto_variacoes SET ativo = false, updated_at = NOW() WHERE id = $1",
      [id]
    );
  }
}

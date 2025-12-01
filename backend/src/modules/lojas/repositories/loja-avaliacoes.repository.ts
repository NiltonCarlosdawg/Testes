import db from "@/config/database.js";
import { TCreateLojaAvaliacaoInput, TUpdateLojaAvaliacaoInput } from "../schemas/loja-avaliacoes.schema.js";
import { ILojaAvaliacaoRepository, TLojaAvaliacaoResponse, TQueryRequest } from "../types/loja-avaliacoes.types.js";
import { LojaAvaliacao } from "../models/loja-avaliacoes.model.js";

export class LojaAvaliacaoRepository implements ILojaAvaliacaoRepository {
  private db: typeof db;

  constructor(dbInstance: typeof db = db) {
    this.db = dbInstance;
  }

  async create(data: TCreateLojaAvaliacaoInput): Promise<string> {
    const query = `
      INSERT INTO loja_avaliacoes (loja_id, avaliador_id, pedido_id, nota, comentario
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [
      data.lojaId,
      data.avaliadorId,
      data.pedidoId || null,
      data.nota,
      data.comentario || null,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  async findById(id: string): Promise<TLojaAvaliacaoResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM loja_avaliacoes WHERE id = $1 AND respondido_em IS NOT NULL OR respondido_em IS NULL",
      [id]
    );
    return result.rows[0] ? new LojaAvaliacao(result.rows[0]).toJSON() : null;
  }

  async findByLojaId(lojaId: string): Promise<TLojaAvaliacaoResponse[]> {
    const result = await this.db.query(
      "SELECT * FROM loja_avaliacoes WHERE loja_id = $1 ORDER BY created_at DESC",
      [lojaId]
    );
    return result.rows.map(row => new LojaAvaliacao(row).toJSON());
  }

  async findByAvaliadorId(avaliadorId: string): Promise<TLojaAvaliacaoResponse[]> {
    const result = await this.db.query(
      "SELECT * FROM loja_avaliacoes WHERE avaliador_id = $1 ORDER BY created_at DESC",
      [avaliadorId]
    );
    return result.rows.map(row => new LojaAvaliacao(row).toJSON());
  }

  async findByPedidoId(pedidoId: string): Promise<TLojaAvaliacaoResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM loja_avaliacoes WHERE pedido_id = $1",
      [pedidoId]
    );
    return result.rows[0] ? new LojaAvaliacao(result.rows[0]).toJSON() : null;
  }

  async getMediaNotaByLojaId(lojaId: string): Promise<number> {
    const result = await this.db.query(
      "SELECT COALESCE(AVG(nota), 0) AS media FROM loja_avaliacoes WHERE loja_id = $1",
      [lojaId]
    );
    return parseFloat(result.rows[0].media) || 0;
  }

  async getAll({ page = 1, limit = 10, search, lojaId, avaliadorId }: TQueryRequest): Promise<{ data: TLojaAvaliacaoResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM loja_avaliacoes WHERE 1=1";
    let countQuery = "SELECT COUNT(*) AS total FROM loja_avaliacoes WHERE 1=1";
    const values: (string | number)[] = [];
    const countValues: (string | number)[] = [];

    if (lojaId) {
      query += ` AND loja_id = $${values.length + 1}`;
      countQuery += ` AND loja_id = $${countValues.length + 1}`;
      values.push(lojaId);
      countValues.push(lojaId);
    }
    if (avaliadorId) {
      query += ` AND avaliador_id = $${values.length + 1}`;
      countQuery += ` AND avaliador_id = $${countValues.length + 1}`;
      values.push(avaliadorId);
      countValues.push(avaliadorId);
    }
    if (search) {
      query += ` AND comentario ILIKE $${values.length + 1}`;
      countQuery += ` AND comentario ILIKE $${countValues.length + 1}`;
      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, values),
      this.db.query(countQuery, countValues),
    ]);

    const data = dataRes.rows.map(row => new LojaAvaliacao(row).toJSON());
    const total = parseInt(countRes.rows[0].total, 10);

    return { data, total };
  }

  async update({ id, data }: { id: string; data: TUpdateLojaAvaliacaoInput }): Promise<TLojaAvaliacaoResponse> {
    const values: (string | number | null | undefined)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      lojaId: "loja_id",
      avaliadorId: "avaliador_id",
      pedidoId: "pedido_id",
      nota: "nota",
      comentario: "comentario",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(value);
        counter++;
      }
    }

    if (fields.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE loja_avaliacoes
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    if (!result.rows[0]) throw new Error("Avaliação não encontrada");

    return new LojaAvaliacao(result.rows[0]).toJSON();
  }

  async responder(id: string, resposta: string): Promise<TLojaAvaliacaoResponse> {
    const query = `
      UPDATE loja_avaliacoes
      SET resposta = $1, respondido_em = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await this.db.query(query, [resposta, id]);
    if (!result.rows[0]) throw new Error("Avaliação não encontrada");

    return new LojaAvaliacao(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<void> {
    await this.db.query("DELETE FROM loja_avaliacoes WHERE id = $1", [id]);
  }
}
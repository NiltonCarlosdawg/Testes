import { Database } from "@/config/database.js";
import { TCreateMetodoPagamentoInput, TUpdateMetodoPagamentoInput } from "../schemas/metodos-pagamento.schema.js";
import { MetodoPagamentoRepository, TMetodoPagamentoResponse } from "../types/metodos-pagamento.types.js";
import { MapMetodoPagamentoRow } from "../models/metodos-pagamento.model.js";

export const createMetodoPagamentoRepository = (db: Database): MetodoPagamentoRepository => {
  const withActive = (baseSql: string, extraParams: any[] = []) => {
    const sql = `${baseSql} AND ativo = true`;
    return { sql, params: extraParams };
  };

  const repo: MetodoPagamentoRepository = {
    create: async (data: TCreateMetodoPagamentoInput): Promise<string> => {
      const sql = `
        INSERT INTO metodos_pagamento 
          (nome, codigo, descricao, icone_url, taxa_percentual, taxa_fixa)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const result = await db.query(sql, [
        data.nome,
        data.codigo,
        data.descricao,
        data.iconeUrl,
        data.taxaPercentual.toString(),
        data.taxaFixa.toString(),
      ]);
      return result.rows[0].id;
    },

    findById: async (id: string): Promise<TMetodoPagamentoResponse | null> => {
      const { sql, params } = withActive(`SELECT * FROM metodos_pagamento WHERE id = $1`, [id]);
      const result = await db.query(sql, params);
      return result.rows[0] ? MapMetodoPagamentoRow(result.rows[0]) : null;
    },

    findByCodigo: async (codigo: string): Promise<TMetodoPagamentoResponse | null> => {
      const { sql, params } = withActive(`SELECT * FROM metodos_pagamento WHERE codigo = $1`, [codigo]);
      const result = await db.query(sql, params);
      return result.rows[0] ? MapMetodoPagamentoRow(result.rows[0]) : null;
    },

    findAll: async ({ page = 1, limit = 10, search, ativo }: { page: number; limit: number; search?: string; ativo?: boolean }) => {
      const offset = (page - 1) * limit;
      let sql = `SELECT * FROM metodos_pagamento WHERE ativo = true`;
      const params: (string | boolean | number)[] = [];
      let counter = 1;

      if (ativo !== undefined) {
        sql += ` AND ativo = $${counter++}`;
        params.push(ativo);
      }

      if (search) {
        sql += ` AND (nome ILIKE $${counter} OR codigo ILIKE $${counter})`;
        params.push(`%${search}%`);
        counter++;
      }

      sql += ` ORDER BY created_at DESC LIMIT $${counter++} OFFSET $${counter++}`;
      params.push(limit, offset);

      const countSql = `SELECT COUNT(*) FROM metodos_pagamento WHERE ativo = true` +
        (ativo !== undefined ? ` AND ativo = $1` : "") +
        (search ? ` AND (nome ILIKE $2 OR codigo ILIKE $2)` : "");

      const countParams = ativo !== undefined ? (search ? [ativo, `%${search}%`] : [ativo]) : search ? [`%${search}%`] : [];

      const [dataResult, countResult] = await Promise.all([
        db.query(sql, params),
        db.query(countSql, countParams),
      ]);

      return {
        data: dataResult.rows.map(MapMetodoPagamentoRow),
        total: parseInt(countResult.rows[0].count, 10),
      };
    },

    update: async ({ id, data }: { id: string; data: TUpdateMetodoPagamentoInput }): Promise<TMetodoPagamentoResponse | null> => {
      const existing = await repo.findById(id);
      if (!existing) return null;

      const sets: string[] = [];
      const values: any[] = [];
      let counter = 1;

      if (data.nome !== undefined) { sets.push(`nome = $${counter++}`); values.push(data.nome); }
      if (data.codigo !== undefined) { sets.push(`codigo = $${counter++}`); values.push(data.codigo); }
      if (data.descricao !== undefined) { sets.push(`descricao = $${counter++}`); values.push(data.descricao); }
      if (data.iconeUrl !== undefined) { sets.push(`icone_url = $${counter++}`); values.push(data.iconeUrl); }
      if (data.taxaPercentual !== undefined) { sets.push(`taxa_percentual = $${counter++}`); values.push(data.taxaPercentual.toString()); }
      if (data.taxaFixa !== undefined) { sets.push(`taxa_fixa = $${counter++}`); values.push(data.taxaFixa.toString()); }

      if (sets.length === 0) return existing;

      sets.push(`updated_at = NOW()`);
      values.push(id);

      const sql = `
        UPDATE metodos_pagamento
        SET ${sets.join(", ")}
        WHERE id = $${counter}
        RETURNING *
      `;

      const result = await db.query(sql, values);
      return result.rows[0] ? MapMetodoPagamentoRow(result.rows[0]) : null;
    },

    delete: async (id: string): Promise<void> => {
      await db.query(`UPDATE metodos_pagamento SET ativo = false, updated_at = NOW() WHERE id = $1`, [id]);
    },

    checkIfInUse: async (id: string): Promise<boolean> => {
      const result = await db.query(
        `SELECT 1 FROM transacoes WHERE metodo_pagamento_id = $1 LIMIT 1`,
        [id]
      );
      return result.rows.length > 0;
    },
  };

  return repo;
};
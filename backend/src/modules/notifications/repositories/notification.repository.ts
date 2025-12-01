import { TCreateNotificacaoInput } from "../schemas/notification.schema.js";
import {
  NotificacaoRepository,
  TNotificacaoResponse,
  TNotificacaoQueryRequest,
} from "../types/notification.types.js";
import { MapNotificacaoRow } from "../models/notification.model.js";
import { Database } from "@/config/database.js";

const TABLE_NAME = "notificacoes";

export const createNotificacaoRepository = (
  db: Database
): NotificacaoRepository => ({
  create: async (data: TCreateNotificacaoInput): Promise<string> => {
    const query = `
      INSERT INTO ${TABLE_NAME} (user_id, tipo, prioridade, titulo, mensagem, referencia_id, referencia_tipo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const values = [
      data.userId,
      data.tipo,
      data.prioridade,
      data.titulo,
      data.mensagem,
      data.referenciaId,
      data.referenciaTipo,
    ];

    const result = await db.query(query, values);
    return result.rows[0].id;
  },

  findById: async (id: string): Promise<TNotificacaoResponse | null> => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] ? MapNotificacaoRow(result.rows[0]) : null;
  },

  findByUserId: async ({
    page = 1,
    limit = 10,
    search,
    userId,
    lida,
    tipo,
  }: TNotificacaoQueryRequest): Promise<{
    data: TNotificacaoResponse[];
    total: number;
  }> => {
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM ${TABLE_NAME}`;
    let countQuery = `SELECT COUNT(*) AS total FROM ${TABLE_NAME}`;
    
    const conditions: string[] = ["user_id = $1"];
    const values: (string | number | boolean)[] = [userId];
    const countValues: (string | number | boolean)[] = [userId];
    let counter = 2;

    if (lida === "true" || lida === "false") {
      conditions.push(`lida = $${counter}`);
      const lidaBool = lida === "true";
      values.push(lidaBool);
      countValues.push(lidaBool);
      counter++;
    }
    
    if (tipo) {
      conditions.push(`tipo = $${counter}`);
      values.push(tipo);
      countValues.push(tipo);
      counter++;
    }

    if (search) {
      conditions.push(
        `(titulo ILIKE $${counter} OR mensagem ILIKE $${counter})`
      );
      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
      counter++;
    }

    query += ` WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT $${counter} OFFSET $${counter + 1}`;
    countQuery += ` WHERE ${conditions.join(" AND ")}`;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, countValues),
    ]);

    const data = dataRes.rows.map((row) => MapNotificacaoRow(row));
    const total = parseInt(countRes.rows[0].total, 10);
    return { data, total };
  },
  
  getUnreadCount: async (userId: string): Promise<number> => {
    const query = `SELECT COUNT(*) AS total FROM ${TABLE_NAME} WHERE user_id = $1 AND lida = false`;
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].total, 10);
  },

  markAsRead: async (
    id: string,
    userId: string
  ): Promise<TNotificacaoResponse | null> => {
    const query = `
      UPDATE ${TABLE_NAME}
      SET lida = true, lida_em = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND lida = false
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    if (!result.rows[0]) return null;
    return MapNotificacaoRow(result.rows[0]);
  },

  markAllAsRead: async (userId: string): Promise<{ count: number }> => {
    const query = `
      UPDATE ${TABLE_NAME}
      SET lida = true, lida_em = NOW(), updated_at = NOW()
      WHERE user_id = $1 AND lida = false
      RETURNING id
    `;
    const result = await db.query(query, [userId]);
    return { count: result.rowCount ?? 0 };
  },
});
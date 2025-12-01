import { TCreateActivityLogInput, TActivityLogQueryRequest } from "../schemas/activity-log.schema.js";
import {
  ActivityLogRepository,
  TActivityLogResponse,
  TActivityLogStatsResponse,
  EntityType,
  ActivityType,
} from "../types/activity-log.types.js";
import { MapActivityLogRow } from "../models/activity-log.model.js";
import { Database } from "@/config/database.js";

const TABLE_NAME = "activity_logs";

export const createActivityLogRepository = (
  db: Database
): ActivityLogRepository => ({
  create: async (data: TCreateActivityLogInput): Promise<string> => {
    const query = `
      INSERT INTO ${TABLE_NAME} (user_id, session_id, activity_type, entity_type, entity_id, description, ip_address, user_agent, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const values = [
      data.userId,
      data.sessionId,
      data.activityType,
      data.entityType,
      data.entityId,
      data.description,
      data.ipAddress,
      data.userAgent,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ];

    const result = await db.query(query, values);
    return result.rows[0].id;
  },

  findById: async (id: string): Promise<TActivityLogResponse | null> => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] ? MapActivityLogRow(result.rows[0]) : null;
  },

  findByUserId: async (userId: string): Promise<TActivityLogResponse[]> => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`;
    const result = await db.query(query, [userId]);
    return result.rows.map(MapActivityLogRow);
  },

  findBySessionId: async (sessionId: string): Promise<TActivityLogResponse[]> => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE session_id = $1 ORDER BY created_at DESC LIMIT 50`;
    const result = await db.query(query, [sessionId]);
    return result.rows.map(MapActivityLogRow);
  },

  findByEntity: async (
    entityType: EntityType,
    entityId: string
  ): Promise<TActivityLogResponse[]> => {
    const query = `SELECT * FROM ${TABLE_NAME} WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC LIMIT 50`;
    const result = await db.query(query, [entityType, entityId]);
    return result.rows.map(MapActivityLogRow);
  },

  getAll: async (
    params: TActivityLogQueryRequest
  ): Promise<{ data: TActivityLogResponse[]; total: number }> => {
    const {
      page = 1,
      limit = 50,
      search,
      userId,
      sessionId,
      activityType,
      entityType,
      entityId,
      startDate,
      endDate,
    } = params;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM ${TABLE_NAME}`;
    let countQuery = `SELECT COUNT(*) AS total FROM ${TABLE_NAME}`;
    const conditions: string[] = [];
    const values: (string | number | Date)[] = [];
    let counter = 1;

    if (userId) {
      conditions.push(`user_id = $${counter++}`);
      values.push(userId);
    }
    if (sessionId) {
      conditions.push(`session_id = $${counter++}`);
      values.push(sessionId);
    }
    if (activityType) {
      conditions.push(`activity_type = $${counter++}`);
      values.push(activityType);
    }
    if (entityType) {
      conditions.push(`entity_type = $${counter++}`);
      values.push(entityType);
    }
    if (entityId) {
      conditions.push(`entity_id = $${counter++}`);
      values.push(entityId);
    }
    if (startDate) {
      conditions.push(`created_at >= $${counter++}`);
      values.push(startDate);
    }
    if (endDate) {
      conditions.push(`created_at <= $${counter++}`);
      values.push(endDate);
    }
    if (search) {
      conditions.push(`description ILIKE $${counter++}`);
      values.push(`%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
    query += whereClause;
    countQuery += whereClause;

    query += ` ORDER BY created_at DESC LIMIT $${counter++} OFFSET $${counter++}`;
    values.push(limit, offset);

    const countValues = values.slice(0, values.length - 2);

    const [dataRes, countRes] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, countValues),
    ]);


    const data = dataRes.rows.map(MapActivityLogRow);
    const total = parseInt(countRes.rows[0].total, 10);
    return { data, total };
  },

  getStats: async (params: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<TActivityLogStatsResponse> => {
    const { startDate, endDate, userId } = params;
    
    const conditions: string[] = [];
    const values: (string | Date)[] = [];
    let counter = 1;

    if (userId) {
      conditions.push(`user_id = $${counter++}`);
      values.push(userId);
    }
    if (startDate) {
      conditions.push(`created_at >= $${counter++}`);
      values.push(startDate);
    }
    if (endDate) {
      conditions.push(`created_at <= $${counter++}`);
      values.push(endDate);
    }
    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
    const whereClauseAnd = conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : "";

    // 1. Total de Atividades
    const totalQuery = `SELECT COUNT(*) AS total FROM ${TABLE_NAME}${whereClause}`;

    // 2. Atividades por Tipo
    const typeQuery = `SELECT activity_type, COUNT(*) AS count FROM ${TABLE_NAME}${whereClause} GROUP BY activity_type`;

    // 3. Top Produtos Vistos
    const productsQuery = `
      SELECT entity_id, COUNT(*) AS view_count 
      FROM ${TABLE_NAME}
      WHERE entity_type = $${counter} AND activity_type = $${counter + 1}${whereClauseAnd.replace(/\$/g, '$$$')}
      GROUP BY entity_id 
      ORDER BY view_count DESC 
      LIMIT 10`;
    const productValues = [...values, EntityType.PRODUCT, ActivityType.PRODUCT_VIEW];

    // 4. Taxa de Abandono (proxy)
    const abandonedQuery = `SELECT COUNT(*) AS count FROM ${TABLE_NAME} WHERE activity_type = $${counter}${whereClauseAnd.replace(/\$/g, '$$$')}`;
    const abandonedValues = [...values, ActivityType.CART_ABANDONED];

    const ordersQuery = `SELECT COUNT(*) AS count FROM ${TABLE_NAME} WHERE activity_type = $${counter}${whereClauseAnd.replace(/\$/g, '$$$')}`;
    const ordersValues = [...values, ActivityType.ORDER_CREATED];
    
    // Executa em paralelo
    const [
      totalRes, 
      typeRes, 
      productsRes,
      abandonedRes,
      ordersRes
    ] = await Promise.all([
      db.query(totalQuery, values),
      db.query(typeQuery, values),
      db.query(productsQuery, productValues),
      db.query(abandonedQuery, abandonedValues),
      db.query(ordersQuery, ordersValues),
    ]);

    const totalActivities = parseInt(totalRes.rows[0].total, 10);
    
    const activitiesByType = typeRes.rows.reduce((acc, row) => {
      acc[row.activity_type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);
    
    const topProductsViewed = productsRes.rows.map(row => ({
      entityId: row.entity_id,
      viewCount: parseInt(row.view_count, 10),
    }));

    const abandonedCount = parseInt(abandonedRes.rows[0].count, 10);
    const ordersCount = parseInt(ordersRes.rows[0].count, 10);
    const totalCarts = abandonedCount + ordersCount;
    const cartAbandonmentRate = (totalCarts > 0) ? (abandonedCount / totalCarts) : 0;

    return {
      totalActivities,
      activitiesByType,
      topProductsViewed,
      cartAbandonmentRate,
    };
  },
});
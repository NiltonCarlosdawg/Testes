import { FastifyRequest } from "fastify";
import { TCreateActivityLogInput, TActivityLogQueryRequest } from "../schemas/activity-log.schema.js";
import { AppError, Result } from "@/utils/result.js";
import { IFAResponseService } from "@/types/query.types.js";
import { ActivityType, EntityType } from "./enums.js";
import { TUserResponse } from "@/modules/users/types/user.types.js";

export { ActivityType, EntityType } from "./enums.js"; 

export type TActivityLogDbRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  activity_type: ActivityType;
  entity_type: EntityType;
  entity_id: string | null;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, string> | null; 
  created_at: Date;
};

export type TActivityLogResponse = {
  id: string;
  userId: string | null;
  sessionId: string | null;
  activityType: ActivityType;
  entityType: EntityType;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
};

export type TActivityLogStatsResponse = {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  topProductsViewed: Array<{ entityId: string; viewCount: number }>;
  cartAbandonmentRate: number;
};

export type TLoggableRequest = FastifyRequest<{
  Body: unknown;
  Querystring: unknown;
  Params: unknown;
}> & {
  user?: TUserResponse; 
  raw: {
    statusCode?: number;
    responseTime?: number; 
  };
};

export type ActivityLogRepository = {
  create: (data: TCreateActivityLogInput) => Promise<string>;
  findById: (id: string) => Promise<TActivityLogResponse | null>;
  findByUserId: (userId: string) => Promise<TActivityLogResponse[]>;
  findBySessionId: (sessionId: string) => Promise<TActivityLogResponse[]>;
  findByEntity: (entityType: EntityType, entityId: string) => Promise<TActivityLogResponse[]>;
  getAll: (params: TActivityLogQueryRequest) => Promise<{ data: TActivityLogResponse[]; total: number }>;
  getStats: (params: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }) => Promise<TActivityLogStatsResponse>;
};

export type ActivityLogService = {
  create: (data: TCreateActivityLogInput) => Promise<Result<string, AppError>>;
  findById: (id: string) => Promise<Result<TActivityLogResponse, AppError>>;
  findByUserId: (userId: string) => Promise<Result<TActivityLogResponse[], AppError>>;
  findBySessionId: (sessionId: string) => Promise<Result<TActivityLogResponse[], AppError>>;
  findByEntity: (entityType: EntityType, entityId: string) => Promise<Result<TActivityLogResponse[], AppError>>;
  getAll: (query: TActivityLogQueryRequest) => Promise<Result<IFAResponseService<TActivityLogResponse>, AppError>>;
  getStats: (params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) => Promise<Result<TActivityLogStatsResponse, AppError>>;
};
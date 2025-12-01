import { 
  TCreateActivityLogInput, 
  createActivityLogSchema, 
  activityLogQuerySchema, 
  TActivityLogQueryRequest
} from "../schemas/activity-log.schema.js";
import { 
  ActivityLogRepository, 
  TActivityLogResponse, 
  EntityType, 
  ActivityLogService,
  TActivityLogStatsResponse
} from "../types/activity-log.types.js";
import { IFAResponseService } from "@/types/query.types.js";
import { CacheService } from "@/config/cache.js";
import { Result, Ok, Err, AppError, ErrorFactory } from "@/utils/result.js";
import { formatZodError, formatZodErrorAndReturnArray } from "@/utils/formatZodError.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";
import { UserRepository } from "@/modules/users/repositories/user.repository.js";
import { logger } from "@/utils/logger.js";

const COMPONENT = "ActivityLogService";

type ActivityLogServiceDeps = {
  repository: ActivityLogRepository;
  userRepository: UserRepository;
  cache: typeof CacheService;
};

export const createActivityLogService = (deps: ActivityLogServiceDeps): ActivityLogService => {
  const { repository, userRepository, cache } = deps;

  const getCacheKey = (id: string) => `activity_log:${id}`;
  const getListCacheKey = (query: TActivityLogQueryRequest) => {
    const { page = 1, limit = 50, search, userId, sessionId, activityType, entityType, entityId, startDate, endDate } = query;
    const parts = [
      page, limit, 
      search || 'all', 
      userId || 'all', 
      sessionId || 'all', 
      activityType || 'all', 
      entityType || 'all', 
      entityId || 'all',
      startDate || 'all',
      endDate || 'all'
    ];
    return `activity_logs:list:${parts.join(':')}`;
  };
  const getStatsCacheKey = (params: { startDate?: string; endDate?: string; userId?: string }) => {
    const { startDate, endDate, userId } = params;
    const parts = [startDate || 'all', endDate || 'all', userId || 'all'];
    return `activity_logs:stats:${parts.join(':')}`;
  };

  const service: ActivityLogService = {
    create: async (data: TCreateActivityLogInput): Promise<Result<string, AppError>> => {
      const validation = createActivityLogSchema.safeParse(data);
      if (!validation.success) {
        const message = formatZodError(validation.error);
        const errors = formatZodErrorAndReturnArray(validation.error);
        return Err(ErrorFactory.validation(message, errors, COMPONENT));
      }
      if (validation.data.userId) {
        const user = await userRepository.findById(validation.data.userId);
        if (!user) {
          logger.warn(`[${COMPONENT}] Tentativa de log para usuário inexistente: ${validation.data.userId}`);
          validation.data.userId = null; 
        }
      }

      try {
        const id = await repository.create(validation.data);
      
        await cache.deletePattern("activity_logs:list:*");
        await cache.deletePattern("activity_logs:stats:*");

        return Ok(id);
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(errorMessage);

          return Err(ErrorFactory.database(
          "Falha ao criar log de atividade",
          "INSERT",
          "activity_logs",
          errorMessage,
          COMPONENT
        ));
      }
    },

    findById: async (id: string): Promise<Result<TActivityLogResponse, AppError>> => {
      if (!id) return Err(ErrorFactory.validation("ID é obrigatório", COMPONENT));

      const cacheKey = getCacheKey(id);
      const item = await cache.getOrSet(cacheKey, 3600, async () => {
        return repository.findById(id);
      });

      if (!item) {
        return Err(ErrorFactory.notFound("Log de atividade não encontrado", "activity_log", id, COMPONENT));
      }

      return Ok(item);
    },

    findByUserId: async (userId: string): Promise<Result<TActivityLogResponse[], AppError>> => {
      if (!userId) return Err(ErrorFactory.validation("User ID é obrigatório", COMPONENT));
      
      const items = await repository.findByUserId(userId);
      return Ok(items);
    },

    findBySessionId: async (sessionId: string): Promise<Result<TActivityLogResponse[], AppError>> => {
      if (!sessionId) return Err(ErrorFactory.validation("Session ID é obrigatório", COMPONENT));

      const items = await repository.findBySessionId(sessionId);
      return Ok(items);
    },

    findByEntity: async (entityType: EntityType, entityId: string): Promise<Result<TActivityLogResponse[], AppError>> => {
      if (!entityType || !entityId) {
        return Err(ErrorFactory.validation("Entity type e entity ID são obrigatórios", COMPONENT));
      }

      const items = await repository.findByEntity(entityType, entityId);
      return Ok(items);
    },

    getAll: async (query: TActivityLogQueryRequest): Promise<Result<IFAResponseService<TActivityLogResponse>, AppError>> => {
      const validation = activityLogQuerySchema.safeParse(query);
      if (!validation.success) {
        return Err(ErrorFactory.validation(formatZodError(validation.error), COMPONENT));
      }

      const { page = 1, limit = 50 } = validation.data;
      validatePaginationParams(page, limit);

      const cacheKey = getListCacheKey(validation.data);
      const result = await cache.getOrSet(cacheKey, 300, async () => {
        const { data, total } = await repository.getAll(validation.data);
        return {
          data,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            total,
          },
        };
      });

      return Ok(result);
    },

    getStats: async (params: { startDate?: string; endDate?: string; userId?: string }): Promise<Result<TActivityLogStatsResponse, AppError>> => {
      const cacheKey = getStatsCacheKey(params);
      const stats: TActivityLogStatsResponse = await cache.getOrSet(cacheKey, 600, async () => {
        const statsParams = {
          startDate: params.startDate ? new Date(params.startDate) : undefined,
          endDate: params.endDate ? new Date(params.endDate) : undefined,
          userId: params.userId,
        };
        return repository.getStats(statsParams);
      });

      return Ok(stats);
    },
  };

  return service;
};
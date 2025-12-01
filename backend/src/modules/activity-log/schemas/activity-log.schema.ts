import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";
import { ActivityType, EntityType } from "../types/activity-log.types.js";

export const createActivityLogSchema = z.object({
  userId: z.string().uuid(MANDATORY("userId")).optional().nullable(),
  sessionId: z.string().min(1, "Session ID é obrigatório").optional().nullable(),
  activityType: z.nativeEnum(ActivityType, {
    required_error: MANDATORY("activityType"),
    invalid_type_error: "Tipo de atividade inválido"
  }),
  entityType: z.nativeEnum(EntityType, {
    required_error: MANDATORY("entityType"),
    invalid_type_error: "Tipo de entidade inválido"
  }),
  entityId: z.string().uuid("Entity ID deve ser um UUID válido").optional().nullable(),
  description: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
  ipAddress: z.string().ip("Endereço IP inválido").optional().nullable(),
  userAgent: z.string().max(1000, "User Agent muito longo").optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export const updateActivityLogSchema = createActivityLogSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Deve fornecer pelo menos um campo para atualizar." }
  );

export const activityLogQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  activityType: z.nativeEnum(ActivityType).optional(),
  entityType: z.nativeEnum(EntityType).optional(),
  entityId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type TCreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
export type TUpdateActivityLogInput = z.infer<typeof updateActivityLogSchema>;
export type TActivityLogQueryRequest = z.infer<typeof activityLogQuerySchema>;
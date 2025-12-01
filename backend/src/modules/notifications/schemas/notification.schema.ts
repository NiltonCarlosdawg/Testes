import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";
import { PRIORIDADE_NOTIFICACAO, TipoNotificacao } from "../types/notification.types.js";

export const createNotificacaoSchema = z.object({
  userId: z.string().uuid(MANDATORY("userId")),
  titulo: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  mensagem: z.string().min(1, "Mensagem é obrigatória").max(1000, "Mensagem muito longa"),
  tipo: z.nativeEnum(TipoNotificacao, {
    required_error: MANDATORY("tipo"),
    invalid_type_error: "Tipo de notificação inválido"
  }),
  prioridade: z.nativeEnum(PRIORIDADE_NOTIFICACAO).default(PRIORIDADE_NOTIFICACAO.MEDIA).optional(),
  enviarEmail: z.boolean().default(false).optional(),
  metadata: z.record(z.any()).optional().nullable(),
  link: z.string().min(3, "Link deve ser uma URL válida").optional().nullable(),
  referenciaId: z.string().uuid().optional().nullable(),
  referenciaTipo: z.string().max(50).optional().nullable(),
});

export const createNotificacaoWithEmailSchema = createNotificacaoSchema.extend({
  forceEmail: z.boolean().default(false),
});

export const createNotificacaoBatchSchema = z.array(createNotificacaoSchema);

export const updateNotificacaoSchema = createNotificacaoSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Deve fornecer pelo menos um campo para atualizar." }
  );

export const notificacaoQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  lida: z.string().transform(val => val === 'true').optional(),
  tipo: z.nativeEnum(TipoNotificacao).optional(),
});

export type TCreateNotificacaoInput = z.infer<typeof createNotificacaoSchema>;
export type TCreateNotificacaoWithEmailInput = z.infer<typeof createNotificacaoWithEmailSchema>;
export type TCreateNotificacaoBatchInput = z.infer<typeof createNotificacaoBatchSchema>;
export type TUpdateNotificacaoInput = z.infer<typeof updateNotificacaoSchema>;
export type TNotificacaoQueryRequest = z.infer<typeof notificacaoQuerySchema>;
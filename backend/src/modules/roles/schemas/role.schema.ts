import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export const createRoleSchema = z.object({
  nome: z.string().min(1, MANDATORY("nome")),
  descricao: z.string().optional(),
  permissions: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      allowed: z.boolean(),
    })
  ),
  ativo: z.boolean().default(true),
});

export const updateRoleSchema = createRoleSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
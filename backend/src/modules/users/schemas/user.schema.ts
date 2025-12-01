import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export const createUserSchema = z.object({
  email: z.string().email("Email inválido").min(1, MANDATORY("email")),
  telefone: z.string().optional(),
  password: z.string().min(6, MANDATORY("passwordHash")),
  primeiroNome: z.string().min(1, MANDATORY("primeiroNome")),
  ultimoNome: z.string().min(1, MANDATORY("ultimoNome")),
  avatarUrl: z.string().optional(),
  roleId: z.string().min(1, MANDATORY("role")),
  status: z.string().optional().default("ativo"),
});

export const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export type TCreateUserInput = z.infer<typeof createUserSchema>;
export type TUpdateUserInput = z.infer<typeof updateUserSchema>;
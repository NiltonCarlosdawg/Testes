import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export const createLojaAvaliacaoSchema = z.object({
  lojaId: z.string().uuid(MANDATORY("lojaId")),
  avaliadorId: z.string().uuid(MANDATORY("avaliadorId")),
  pedidoId: z.string().uuid().optional(),
  nota: z.number().int().min(1).max(5, "Nota deve ser de 1 a 5"),
  comentario: z.string().min(1, MANDATORY("comentario")).optional(),
});

export const updateLojaAvaliacaoSchema = createLojaAvaliacaoSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export const responderAvaliacaoSchema = z.object({
  resposta: z.string().min(1, "Resposta é obrigatória"),
});

export type TCreateLojaAvaliacaoInput = z.infer<typeof createLojaAvaliacaoSchema>;
export type TUpdateLojaAvaliacaoInput = z.infer<typeof updateLojaAvaliacaoSchema>;
export type TResponderAvaliacaoInput = z.infer<typeof responderAvaliacaoSchema>;
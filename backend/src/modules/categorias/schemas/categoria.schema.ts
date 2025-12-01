import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export const CreateCategoriaSchema = z.object({
  nome: z.string().min(1, MANDATORY("nome")),
  slug: z.string().min(1, MANDATORY("slug")),
  descricao: z.string().optional(),
  iconeUrl: z.string().optional(),
  ordem: z.number().int().default(0),
  ativo: z.boolean().default(true),
  categoriaPaiId: z.string().uuid().optional(),
});

export const updateCategoriaSchema = CreateCategoriaSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export type TCreateCategoriaInput = z.infer<typeof CreateCategoriaSchema>;
export type TUpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;

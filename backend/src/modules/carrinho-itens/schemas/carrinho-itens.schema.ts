import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export const createCarrinhoItemSchema = z.object({
  userId: z.string().uuid(MANDATORY("userId")),
  produtoId: z.string().uuid(MANDATORY("produtoId")),
  variacaoId: z.string().uuid("ID de variação inválido").optional().nullable(),
  quantidade: z
    .number()
    .int()
    .positive("Quantidade deve ser pelo menos 1")
    .default(1),
});

export const updateCarrinhoItemSchema = z
  .object({
    quantidade: z
      .number()
      .int()
      .positive("Quantidade deve ser pelo menos 1"),
  })
  .partial() 
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Deve fornecer pelo menos um campo para atualizar." }
  );

export type TCreateCarrinhoItemInput = z.infer<typeof createCarrinhoItemSchema>;
export type TUpdateCarrinhoItemInput = z.infer<typeof updateCarrinhoItemSchema>;

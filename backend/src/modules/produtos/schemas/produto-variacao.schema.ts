import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export const atributosVariacaoSchema = z.record(z.any()).optional().nullable();

export const createProdutoVariacaoSchema = z.object({
  produtoId: z.string().uuid(MANDATORY("produtoId")),
  nome: z.string().min(1, MANDATORY("nome")),
  sku: z.string().optional().nullable(),
  precoAdicional: z.number().min(0, "Preço adicional não pode ser negativo").optional().default(0),
  quantidadeEstoque: z.number().int().min(0, "Estoque não pode ser negativo").optional().default(0),
  atributos: atributosVariacaoSchema,
  ativo: z.boolean().optional().default(true),
});

export const updateProdutoVariacaoSchema = createProdutoVariacaoSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export type TCreateProdutoVariacaoInput = z.infer<typeof createProdutoVariacaoSchema>;
export type TUpdateProdutoVariacaoInput = z.infer<typeof updateProdutoVariacaoSchema>;

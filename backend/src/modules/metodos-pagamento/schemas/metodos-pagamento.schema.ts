import { z } from "zod";

export const createMetodoPagamentoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  codigo: z.string().min(2, "Código deve ter pelo menos 2 caracteres"),
  descricao: z.string().max(500).optional().nullable(),
  iconeUrl: z.string().optional().nullable(),
  taxaPercentual: z.coerce.number().min(0).max(100).default(0),
  taxaFixa: z.coerce.number().min(0).default(0),
});

export const updateMetodoPagamentoSchema = createMetodoPagamentoSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Deve fornecer pelo menos um campo para atualizar.",
  });

export type TCreateMetodoPagamentoInput = z.infer<typeof createMetodoPagamentoSchema>;
export type TUpdateMetodoPagamentoInput = z.infer<typeof updateMetodoPagamentoSchema>;
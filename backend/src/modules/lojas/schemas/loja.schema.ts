import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";

export enum StatusLoja {
  PENDENTE = "pendente",
  APROVADO = "aprovado",
  REJEITADO = "rejeitado",
}

export const enderecoComercialSchema = z.object({
  rua: z.string().min(1, MANDATORY("rua")),
  numero: z.string().optional(),
  bairro: z.string().min(1, MANDATORY("bairro")),
  cidade: z.string().min(1, MANDATORY("cidade")),
  estado: z.string().min(1, MANDATORY("estado")),
  cep: z.string().min(1, MANDATORY("cep")),
  complemento: z.string().optional(),
}).optional();

export const createLojaSchema = z.object({
  nome: z.string().min(1, MANDATORY("nome")),
  descricao: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  status: z.nativeEnum(StatusLoja).default(StatusLoja.PENDENTE),
  documentoIdentificacao: z.string().optional(),
  emailComercial: z.string().email("Email comercial inválido").optional(),
  telefoneComercial: z.string().optional(),
  enderecoComercial: enderecoComercialSchema,
  aprovadoPor: z.string().uuid().optional(),
  aprovadoEm: z.string().datetime().optional(),
});

export const updateLojaSchema = createLojaSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export type TCreateLojaInput = z.infer<typeof createLojaSchema>;
export type TUpdateLojaInput = z.infer<typeof updateLojaSchema>;
import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";
import { CONDICAOPRODUTO } from "../types/produto.types.js";

export const createProdutoSchema = z.object({
  lojaId: z.string().uuid(MANDATORY("lojaId")),
  titulo: z.string().min(1, MANDATORY("titulo")),
  descricao: z.string().min(1, MANDATORY("descricao")),
  categoriaId: z.string().uuid().optional(),
  preco: z.coerce.number().min(0, MANDATORY("preco")),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  condicao: z.nativeEnum(CONDICAOPRODUTO).default(CONDICAOPRODUTO.ACEITAVEL),
  quantidadeEstoque: z.number().int().default(0),
  quantidadeMinima: z.number().int().default(1),
  permitePedidoSemEstoque: z.boolean().default(false),
  sku: z.string().optional(),
  codigoBarras: z.string().optional(),
  pesoKg: z.coerce.number().optional(),
  alturaCm: z.coerce.number().optional(),
  larguraCm: z.coerce.number().optional(),
  ativo: z.boolean().default(true),

  tamanho: z.string().optional(),
  cor: z.string().optional(),
  material: z.string().optional(),
  genero: z.string().optional(),
  idadeGrupo: z.string().optional(),

  tags: z.array(z.string()).optional(),
  atributos: z.record(z.any()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(MANDATORY("image url")),
        altText: z.string().optional(),
        position: z.number().int().min(1).default(1),
        isPrincipal: z.boolean().default(false),
      })
    )
    .min(1, "Pelo menos uma imagem é obrigatória"),
});

export const updateProdutoSchema = createProdutoSchema
  .omit({ images: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Deve fornecer pelo menos um campo para atualizar.",
  });

export type TCreateProdutoInput = z.infer<typeof createProdutoSchema>;
export type TUpdateProdutoInput = z.infer<typeof updateProdutoSchema>;

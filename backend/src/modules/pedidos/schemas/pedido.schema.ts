import { z } from "zod";
import { MANDATORY } from "@/utils/CONSTANTS.js";
import { StatusPagamento, StatusPedido } from "../types/pedido.types.js";

export const enderecoEntregaSchema = z.object({
  rua: z.string().min(1, MANDATORY("rua")),
  numero: z.string().min(1, MANDATORY("numero")),
  complemento: z.string().optional(),
  bairro: z.string().min(1, MANDATORY("bairro")),
  cidade: z.string().min(1, MANDATORY("cidade")),
  estado: z.string().min(2, "Estado deve ter 2 caracteres"),
  pais: z.string().default("Brasil"),
});

export const createPedidoItemSchema = z.object({
  produtoId: z.string().uuid(MANDATORY("produtoId")),
  variacaoId: z.string().uuid().optional(),
  titulo: z.string().min(1, MANDATORY("titulo")),
  preco: z.number().positive("Preço deve ser positivo"),
  quantidade: z.number().int().positive("Quantidade deve ser positiva"),
  subtotal: z.number().positive("Subtotal deve ser positivo"),
  imagemUrl: z.string().url("URL da imagem inválida").optional(),
});
export type TCreatePedidoItemInput = z.infer<typeof createPedidoItemSchema>;

export const createPedidoSchema = z.object({
  compradorId: z.string().uuid(MANDATORY("compradorId")),
  lojaId: z.string().uuid(MANDATORY("lojaId")),
  subtotal: z.number().positive("Subtotal deve ser positivo"),
  valorFrete: z.number().min(0, "Frete não pode ser negativo").default(0),
  desconto: z.number().min(0, "Desconto não pode ser negativo").default(0),
  total: z.number().positive("Total deve ser positivo"),
  metodoPagamentoId: z.string().uuid().optional(),
  statusPagamento: z.nativeEnum(StatusPagamento).default(StatusPagamento.PENDENTE),
  status: z.nativeEnum(StatusPedido).default(StatusPedido.PENDENTE),
  enderecoEntrega: enderecoEntregaSchema,
  observacoesComprador: z.string().optional(),
  itens: z.array(createPedidoItemSchema).min(1, "O pedido deve ter pelo menos um item."),
});

export const updatePedidoSchema = z.object({
  codigoRastreio: z.string().optional(),
  transportadora: z.string().optional(),
  previsaoEntrega: z.string().datetime().optional(), 
  observacoesVendedor: z.string().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Deve fornecer pelo menos um campo para atualizar." }
);

export const updatePedidoStatusSchema = z.object({
  status: z.nativeEnum(StatusPedido),
  statusPagamento: z.nativeEnum(StatusPagamento).optional(),
  motivoCancelamento: z.string().optional(),
  codigoRastreio: z.string().optional(),
  transportadora: z.string().optional(),
});

export type TCreatePedidoInput = z.infer<typeof createPedidoSchema>;
export type TUpdatePedidoInput = z.infer<typeof updatePedidoSchema>;
export type TUpdatePedidoStatusInput = z.infer<typeof updatePedidoStatusSchema>;
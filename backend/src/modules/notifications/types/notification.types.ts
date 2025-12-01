import {
  TCreateNotificacaoInput,
} from "../schemas/notification.schema.js";
import { TQueryRequest } from "@/types/query.types.js";
import { Result, AppError } from "@/utils/result.js";
import { IFAResponseService } from "@/types/query.types.js";

export enum TipoNotificacao {
  SISTEMA = "sistema",        
  TAREFA = "tarefa",         
  MENSAGEM = "mensagem",      
  ALERTA = "alerta",         
  
  LOJA_PENDENTE = "loja_pendente",
  LOJA_APROVADA = "loja_aprovada",
  LOJA_REJEITADA = "loja_rejeitada",
  LOJA_REMOVIDA = "loja_removida",

  PEDIDO_NOVO = "pedido_novo",
  PEDIDO_PAGO = "pedido_pago",
  PEDIDO_ENVIADO = "pedido_enviado",
  PEDIDO_ENTREGUE = "pedido_entregue",
  PEDIDO_CANCELADO = "pedido_cancelado",

  ESTOQUE_BAIXO = "estoque_baixo",
  PRODUTO_NOVA_AVALIACAO = "produto_nova_avaliacao",
  
  SEGURANCA = "seguranca",
  BEM_VINDO = "bem_vindo",

  PROMOCAO = "promocao",
}

export enum PRIORIDADE_NOTIFICACAO {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export type TNotificacaoDbRow = {
  id: string;
  user_id: string;
  tipo: TipoNotificacao;
  prioridade: PRIORIDADE_NOTIFICACAO,
  titulo: string;
  mensagem: string;
  referencia_id: string | null;
  referencia_tipo: string | null;
  lida: boolean;
  lida_em: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type TNotificacaoResponse = {
  id: string;
  userId: string;
  tipo: TipoNotificacao;
  prioridade: PRIORIDADE_NOTIFICACAO;
  titulo: string;
  mensagem: string;
  referenciaId: string | null;
  referenciaTipo: string | null;
  lida: boolean;
  lidaEm: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TNotificacaoQueryRequest = TQueryRequest & {
  userId: string;
  lida?: string;
  tipo?: TipoNotificacao;
};

export type NotificacaoRepository = {
  create: (data: TCreateNotificacaoInput) => Promise<string>;
  findById: (id: string) => Promise<TNotificacaoResponse | null>;
  findByUserId: (
    params: TNotificacaoQueryRequest
  ) => Promise<{ data: TNotificacaoResponse[]; total: number }>;
  getUnreadCount: (userId: string) => Promise<number>;
  markAsRead: (
    id: string,
    userId: string
  ) => Promise<TNotificacaoResponse | null>;
  markAllAsRead: (userId: string) => Promise<{ count: number }>;
};

export type NotificacaoService = {
  create: (
    data: TCreateNotificacaoInput
  ) => Promise<Result<string, AppError>>;
  
  createBatch: (
    notifications: TCreateNotificacaoInput[]
  ) => Promise<Result<{ successes: string[]; failures: Array<{ index: number; error: string }> }, AppError>>;
  
  createWithEmail: (
    data: TCreateNotificacaoInput & { forceEmail: boolean }
  ) => Promise<Result<{ notificationId: string; emailSent: boolean }, AppError>>;
  
  findById: (
    id: string,
    userId: string
  ) => Promise<Result<TNotificacaoResponse, AppError>>;
  
  findByUserId: (
    query: TNotificacaoQueryRequest
  ) => Promise<Result<IFAResponseService<TNotificacaoResponse>, AppError>>;
  
  getUnreadCount: (
    userId: string
  ) => Promise<Result<{ count: number }, AppError>>;
  
  markAsRead: (
    id: string,
    userId: string
  ) => Promise<Result<TNotificacaoResponse, AppError>>;
  
  markAllAsRead: (
    userId: string
  ) => Promise<Result<{ count: number }, AppError>>;
  
};
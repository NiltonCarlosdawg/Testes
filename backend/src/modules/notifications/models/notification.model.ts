import {
  PRIORIDADE_NOTIFICACAO,
  TNotificacaoDbRow,
  TNotificacaoResponse,
  TipoNotificacao,
} from "../types/notification.types.js";

export function MapNotificacaoRow(
  row: TNotificacaoDbRow
): TNotificacaoResponse {
  return {
    id: row.id,
    userId: row.user_id,
    tipo: row.tipo,
    titulo: row.titulo,
    prioridade: row.prioridade,
    mensagem: row.mensagem,
    referenciaId: row.referencia_id,
    referenciaTipo: row.referencia_tipo,
    lida: row.lida,
    lidaEm: row.lida_em,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class Notificacao {
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

  constructor(data: TNotificacaoDbRow) {
    this.id = data.id;
    this.userId = data.user_id;
    this.tipo = data.tipo;
    this.prioridade = data.prioridade
    this.titulo = data.titulo;
    this.mensagem = data.mensagem;
    this.referenciaId = data.referencia_id;
    this.referenciaTipo = data.referencia_tipo;
    this.lida = data.lida;
    this.lidaEm = data.lida_em ? new Date(data.lida_em) : null;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  toJSON(): TNotificacaoResponse {
    return {
      id: this.id,
      userId: this.userId,
      tipo: this.tipo,
      titulo: this.titulo,
      prioridade: this.prioridade,
      mensagem: this.mensagem,
      referenciaId: this.referenciaId,
      referenciaTipo: this.referenciaTipo,
      lida: this.lida,
      lidaEm: this.lidaEm,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
import { TLojaAvaliacaoDbRow, TLojaAvaliacaoResponse } from "../types/loja-avaliacoes.types.js";

export class LojaAvaliacao {
  id: string;
  lojaId: string;
  avaliadorId: string;
  pedidoId: string | null;
  nota: number;
  comentario: string | null;
  resposta: string | null;
  respondidoEm: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: TLojaAvaliacaoDbRow) {
    this.id = data.id;
    this.lojaId = data.loja_id;
    this.avaliadorId = data.avaliador_id;
    this.pedidoId = data.pedido_id;
    this.nota = data.nota;
    this.comentario = data.comentario;
    this.resposta = data.resposta;
    this.respondidoEm = data.respondido_em ? new Date(data.respondido_em) : null;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  toJSON(): TLojaAvaliacaoResponse {
    return {
      id: this.id,
      lojaId: this.lojaId,
      avaliadorId: this.avaliadorId,
      pedidoId: this.pedidoId,
      nota: this.nota,
      comentario: this.comentario,
      resposta: this.resposta,
      respondidoEm: this.respondidoEm,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
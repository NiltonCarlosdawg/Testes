import {
  TCarrinhoItemDbRow,
  TCarrinhoItemResponse,
} from "../types/carrinho-itens.types.js";

export class CarrinhoItem {
  id: string;
  userId: string;
  produtoId: string;
  variacaoId: string | null;
  quantidade: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: TCarrinhoItemDbRow) {
    this.id = data.id;
    this.userId = data.user_id;
    this.produtoId = data.produto_id;
    this.variacaoId = data.variacao_id;
    this.quantidade = data.quantidade;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  public toJSON(): TCarrinhoItemResponse {
    return {
      id: this.id,
      userId: this.userId,
      produtoId: this.produtoId,
      variacaoId: this.variacaoId,
      quantidade: this.quantidade,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

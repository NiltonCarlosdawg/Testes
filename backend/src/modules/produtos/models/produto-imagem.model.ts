import { TProdutoImagemDbRow, TProdutoImagemResponse } from "../types/produto.types.js";

export class ProdutoImagem {
  id: string;
  url: string;
  textoAlternativo?: string;
  posicao: number;
  isPrincipal: boolean;

  constructor(data: TProdutoImagemDbRow) {
    this.id = data.id;
    this.url = data.url;
    this.textoAlternativo = data.texto_alternativo ?? undefined;
    this.posicao = Number(data.posicao);
    this.isPrincipal = data.is_principal;
  }

  toJSON(): TProdutoImagemResponse {
    return {
      id: this.id,
      url: this.url,
      textoAlternativo: this.textoAlternativo,
      posicao: this.posicao,
      isPrincipal: this.isPrincipal,
    };
  }
}
import {
  TProdutoVariacaoDbRow,
  TProdutoVariacaoResponse,
  TAtributosVariacao,
} from "../types/produto-variacao.types.js";

export class ProdutoVariacao {
  id: string;
  produtoId: string;
  nome: string;
  sku: string | null;
  precoAdicional: number;
  quantidadeEstoque: number;
  atributos: TAtributosVariacao;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: TProdutoVariacaoDbRow) {
    this.id = data.id;
    this.produtoId = data.produto_id;
    this.nome = data.nome;
    this.sku = data.sku;
    this.precoAdicional = parseFloat(data.preco_adicional || "0");
    this.quantidadeEstoque = data.quantidade_estoque;
    this.atributos = this.parseAtributos(data.atributos);
    this.ativo = data.ativo;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  private parseAtributos(
    atributos: TAtributosVariacao | string | null
  ): TAtributosVariacao {
    if (typeof atributos === "string") {
      try {
        return JSON.parse(atributos) as TAtributosVariacao;
      } catch (error) {
        console.error("Erro ao fazer parse dos atributos:", error);
        return null;
      }
    }
    return atributos || null;
  }

  public toJSON(): TProdutoVariacaoResponse {
    return {
      id: this.id,
      produtoId: this.produtoId,
      nome: this.nome,
      sku: this.sku,
      precoAdicional: this.precoAdicional,
      quantidadeEstoque: this.quantidadeEstoque,
      atributos: this.atributos,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

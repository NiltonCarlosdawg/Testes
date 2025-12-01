import { TLojaDbRow, TLojaResponse, TEnderecoComercial, StatusLoja } from "../types/loja.types.js";

export class Loja {
  id: string;
  donoId: string;
  nome: string;
  descricao: string | undefined;
  logoUrl: string | undefined;
  bannerUrl: string | undefined;
  status: StatusLoja;
  documentoIdentificacao: string | undefined;
  emailComercial: string | undefined;
  telefoneComercial: string | undefined;
  enderecoComercial: TEnderecoComercial | undefined;
  aprovadoPor: string | undefined;
  aprovadoEm: Date | undefined;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: TLojaDbRow) {
    this.id = data.id;
    this.donoId = data.dono_id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.logoUrl = data.logo_url;
    this.bannerUrl = data.banner_url;
    this.status = data.status;
    this.documentoIdentificacao = data.documento_identificacao;
    this.emailComercial = data.email_comercial;
    this.telefoneComercial = data.telefone_comercial;
    this.enderecoComercial = this.parseEnderecoComercial(data.endereco_comercial);
    this.aprovadoPor = data.aprovado_por;
    this.aprovadoEm = data.aprovado_em ? new Date(data.aprovado_em) : undefined;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  private parseEnderecoComercial(endereco: TEnderecoComercial | string | undefined): TEnderecoComercial | undefined {
    if (typeof endereco === "string") {
      try {
        return JSON.parse(endereco);
      } catch (error) {
        console.error("Erro ao fazer parse do endereco_comercial:", error);
        return undefined;
      }
    }
    return endereco;
  }

  toJSON(): TLojaResponse {
    return {
      id: this.id,
      donoId: this.donoId,
      nome: this.nome,
      descricao: this.descricao ?? "",
      logoUrl: this.logoUrl ?? "",
      bannerUrl: this.bannerUrl ?? "",
      status: this.status,
      documentoIdentificacao: this.documentoIdentificacao ?? "",
      emailComercial: this.emailComercial,
      telefoneComercial: this.telefoneComercial,
      enderecoComercial: this.enderecoComercial,
      aprovadoPor: this.aprovadoPor,
      aprovadoEm: this.aprovadoEm,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
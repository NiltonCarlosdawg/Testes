import { TMetodoPagamentoDbRow, TMetodoPagamentoResponse } from "../types/metodos-pagamento.types.js";

export function MapMetodoPagamentoRow(row: TMetodoPagamentoDbRow): TMetodoPagamentoResponse {
  return {
    id: row.id,
    nome: row.nome,
    codigo: row.codigo,
    descricao: row.descricao,
    iconeUrl: row.icone_url,
    taxaPercentual: parseFloat(row.taxa_percentual),
    taxaFixa: parseFloat(row.taxa_fixa),
    ativo: row.ativo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class MetodoPagamento {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  iconeUrl: string | null;
  taxaPercentual: number;
  taxaFixa: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: TMetodoPagamentoDbRow) {
    this.id = data.id;
    this.nome = data.nome;
    this.codigo = data.codigo;
    this.descricao = data.descricao;
    this.iconeUrl = data.icone_url;
    this.taxaPercentual = parseFloat(data.taxa_percentual);
    this.taxaFixa = parseFloat(data.taxa_fixa);
    this.ativo = data.ativo;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  toJSON(): TMetodoPagamentoResponse {
    return {
      id: this.id,
      nome: this.nome,
      codigo: this.codigo,
      descricao: this.descricao,
      iconeUrl: this.iconeUrl,
      taxaPercentual: this.taxaPercentual,
      taxaFixa: this.taxaFixa,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
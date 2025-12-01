import { TCreateLojaInput, TUpdateLojaInput } from "../schemas/loja.schema.js";

export enum StatusLoja {
  APROVADO = "aprovado",
  PENDENTE = "pendente",
  ATIVA = "ativa",
  SUSPENSA = "suspensa",
  INATIVA = "inativa",
}

export type TEnderecoComercial = {
  rua: string;
  numero?: string | undefined;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string | undefined;
};

export type TLojaDbRow = {
  id: string;
  dono_id: string;
  nome: string;
  descricao?: string;
  logo_url?: string;
  banner_url?: string;
  status: StatusLoja;
  documento_identificacao?: string;
  email_comercial?: string;
  telefone_comercial?: string;
  endereco_comercial?: TEnderecoComercial | string;
  aprovado_por?: string;
  aprovado_em?: Date;
  created_at: Date;
  updated_at: Date;
};

export type TLojaResponse = {
  id: string;
  donoId: string;
  nome: string;
  descricao?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: StatusLoja;
  documentoIdentificacao?: string;
  emailComercial?: string;
  telefoneComercial?: string;
  enderecoComercial?: TEnderecoComercial;
  aprovadoPor?: string;
  aprovadoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface ILojaRepository {
  create(data: TCreateLojaInput, donoId: string): Promise<string>;
  findById(id: string): Promise<TLojaResponse | null>;
  findByNome(nome: string): Promise<TLojaResponse | null>;
  findByDonoId(donoId: string): Promise<TLojaResponse[]>;
  getAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: TLojaResponse[]; total: number }>;
  update(params: { id: string; data: TUpdateLojaInput }): Promise<TLojaResponse>;
  delete(id: string): Promise<void>;
}
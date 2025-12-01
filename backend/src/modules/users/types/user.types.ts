import { TFindAllResponse } from "@/types/query.types.js";
import { TCreateUserInput, TUpdateUserInput } from "../schemas/user.schema.js";

export enum USERSTATUS {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

export type TUserDbRow = {
  id: string;
  email: string;
  telefone: string | null;
  password_hash: string;
  primeiro_nome: string;
  ultimo_nome: string;
  avatar_url: string | null;
  status: USERSTATUS;
  email_verificado: boolean;
  telefone_verificado: boolean;
  role_id: string;
  created_at: Date;
  updated_at: Date;
};


export type TUserResponse = {
  id: string;
  email: string;
  telefone: string | null;
  passwordHash: string;
  primeiroNome: string;
  ultimoNome: string;
  avatarUrl: string | null;
  status: USERSTATUS;
  emailVerificado: boolean;
  telefoneVerificado: boolean;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface TLoginDTO {
  email: string;
  password: string
}

export interface IUserRepository {
  create(data: TCreateUserInput): Promise<string>;
  findById(id: string): Promise<TUserResponse | null>;
  findByEmail(email: string): Promise<TUserResponse | null>;
  findByUsername(username: string): Promise<TUserResponse | null>;
  findByEmailWithPassword(email: string): Promise<TUserDbRow | null>;
  updateLastLogin(id: string): Promise<void>;
  update(id: string, data: TUpdateUserInput): Promise<TUserResponse>;
  delete(id: string): Promise<void>;
  getAll(page: number, limit: number, search?: string): Promise<TFindAllResponse<TUserResponse>>;
}


import { CreateRoleInput, UpdateRoleInput } from "../schemas/role.schema.js";

export type TRolePermission = {
  key: string;
  name: string;
  allowed: boolean;
};

export type TRoleType = {
  id: string;
  nome: string;
  descricao?: string;
  permissions: TRolePermission[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TRoleDbRow = {
  id: string;
  nome: string;
  descricao?: string;
  permissions: string | TRolePermission[];
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IRoleRepository {
  create(data: CreateRoleInput): Promise<string>;
  findById(id: string): Promise<TRoleType | null>;
  findByName(nome: string): Promise<TRoleType | null>;
  findAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: TRoleType[]; total: number }>;
  findAllWithoutPermissions(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: TRoleType[]; total: number }>;
  update(params: { id: string; data: UpdateRoleInput }): Promise<TRoleType>;
  delete(id: string): Promise<void>;
  findByPermission(permissionKey: string): Promise<TRoleType[]>;
}
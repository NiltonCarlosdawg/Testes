import { TRoleDbRow, TRolePermission, TRoleType } from "../types/role.types.js";

export class Role {
  id: string;
  nome: string;
  descricao: string | undefined;
  permissions: TRolePermission[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: TRoleDbRow) {
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.permissions = this.parsePermissions(data.permissions);
    this.ativo = data.ativo;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  private parsePermissions(permissions: string | TRolePermission[]): TRolePermission[] {
    if (Array.isArray(permissions)) {
      return permissions;
    }
    if (typeof permissions === "string") {
      try {
        const parsed = JSON.parse(permissions);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Erro ao fazer parse das permissions:", error);
        return [];
      }
    }
    return [];
  }

  toJSON(): TRoleType {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao ?? "",
      permissions: this.permissions,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
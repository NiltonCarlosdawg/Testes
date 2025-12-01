import { TUserDbRow, TUserResponse, USERSTATUS } from "../types/user.types.js";

export class User {
  private id: string;
  private email: string;
  private telefone: string | null;
  private passwordHash: string;
  private primeiroNome: string;
  private ultimoNome: string;
  private avatarUrl: string | null;
  private status: USERSTATUS;
  private emailVerificado: boolean;
  private telefoneVerificado: boolean;
  private roleId: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(data: TUserDbRow) {
    this.id = data.id;
    this.email = data.email;
    this.telefone = data.telefone;
    this.passwordHash = data.password_hash;
    this.primeiroNome = data.primeiro_nome;
    this.ultimoNome = data.ultimo_nome;
    this.avatarUrl = data.avatar_url;
    this.status = data.status;
    this.emailVerificado = data.email_verificado;
    this.telefoneVerificado = data.telefone_verificado;
    this.roleId = data.role_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toJSON(): TUserResponse {
    return {
      id: this.id,
      email: this.email,
      telefone: this.telefone,
      passwordHash: this.passwordHash,
      primeiroNome: this.primeiroNome,
      ultimoNome: this.ultimoNome,
      avatarUrl: this.avatarUrl,
      status: this.status,
      emailVerificado: this.emailVerificado,
      telefoneVerificado: this.telefoneVerificado,
      roleId: this.roleId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default User;
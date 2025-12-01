import db from "@/config/database.js";
import {
  IUserRepository,
  TUserDbRow,
  TUserResponse,
} from "../types/user.types.js";
import {
  TCreateUserInput,
  TUpdateUserInput,
} from "../schemas/user.schema.js";
import User from "../models/user.model.js";
import { TFindAllResponse } from "@/types/query.types.js";

export class UserRepository implements IUserRepository {
  async create(data: TCreateUserInput): Promise<string> {
    const query = `
      INSERT INTO users (
        email, telefone, password_hash,
        primeiro_nome, ultimo_nome,
        avatar_url, status,
        email_verificado, telefone_verificado,
        role_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const values = [
      data.email,
      data.telefone,
      data.password,
      data.primeiroNome,
      data.ultimoNome,
      data.avatarUrl,
      data.status ?? "ativo",
      false,
      false,
      data.roleId,
    ];

    const result = await db.query(query, values);
    return result.rows[0].id;
  }

  async ownerExist(id: string): Promise<string | null>{
    const result = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    return result.rows[0] ?? null
  }


  async findByUsername(username: string): Promise<TUserResponse | null> {
    const res = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    return res.rows[0] ? new User(res.rows[0]).toJSON() : null;
  }

  async findByEmailWithPassword(email: string): Promise<TUserDbRow | null> {
    const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0] ?? null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.query("UPDATE users SET updated_at = NOW() WHERE id = $1", [id]);
  }

  async findById(id: string): Promise<TUserResponse | null> {
    const res = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0] ? new User(res.rows[0]).toJSON() : null;
  }

  async findByEmail(email: string): Promise<TUserResponse | null> {
    const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0] ? new User(res.rows[0]).toJSON() : null;
  }

  async update(
    id: string,
    data: TUpdateUserInput
  ): Promise<TUserResponse> {
    const values: (string | boolean | Date)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      email: "email",
      telefone: "telefone",
      passwordHash: "password_hash",
      primeiroNome: "primeiro_nome",
      ultimoNome: "ultimo_nome",
      avatarUrl: "avatar_url",
      status: "status",
      roleId: "role_id",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(value);
        counter++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (!result.rows[0]) {
      throw new Error("Update failed: user not found or no changes made");
    }

    return new User(result.rows[0]).toJSON();
  }


  async delete(id: string): Promise<void> {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
  }

  async getAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<TFindAllResponse<TUserResponse>> {
    const offset = (page - 1) * limit;
    const values: any[] = [];
    let where = "";

    if (search) {
      values.push(`%${search}%`);
      where = `WHERE email ILIKE $1 OR primeiro_nome ILIKE $1 OR ultimo_nome ILIKE $1`;
    }

    const query = `
      SELECT * FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM users
      ${where}
    `;

    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, search ? [values[0]] : []),
    ]);

    const data = dataRes.rows.map((row: TUserDbRow) => new User(row).toJSON());
    const total = Number(countRes.rows[0].total);

    return { data, total };
  }
}

export default UserRepository;

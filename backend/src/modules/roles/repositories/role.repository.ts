import db from "@/config/database.js";
import { CreateRoleInput, UpdateRoleInput } from "../schemas/role.schema.js";
import { IRoleRepository, TRolePermission, TRoleType } from "../types/role.types.js";
import { Role } from "../models/role.model.js";
import { TQueryRequest, TFindAllResponse } from "@/types/query.types.js";
import { NotFoundException } from "@/utils/domain.js";

export class RoleRepository implements IRoleRepository {
  async create(data: CreateRoleInput): Promise<string> {
    const query = `
      INSERT INTO roles (nome, descricao, permissions, ativo)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const permissionsJson = JSON.stringify(data.permissions);
    const values = [data.nome, data.descricao, permissionsJson, data.ativo];
    const result = await db.query(query, values);
    return result.rows[0].id;
  }

  async findByName(nome: string): Promise<TRoleType> {
    const result = await db.query("SELECT * FROM roles WHERE nome = $1 LIMIT 1", [nome]);
    return new Role(result.rows[0]).toJSON();
  }

  async findById(id: string): Promise<TRoleType | null> {
    const result = await db.query("SELECT * FROM roles WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return null;
    }
    return new Role(result.rows[0]).toJSON();
  }

  async findRolePadrao(): Promise<TRoleType> {
    const result = await db.query("SELECT * FROM roles ORDER BY created_at DESC LIMIT $1", [1]);
    return new Role(result.rows[0]).toJSON();
  }

  async findAll({
    page,
    limit,
    search,
  }: TQueryRequest): Promise<TFindAllResponse<TRoleType>> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM roles";
    let countQuery = "SELECT COUNT(*) AS total FROM roles";
    const values: (string | number)[] = [];

    if (search) {
      query += ` WHERE nome ILIKE $1 OR descricao ILIKE $1`;
      countQuery += ` WHERE nome ILIKE $1 OR descricao ILIKE $1`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [result, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const data = result.rows.map((row) => new Role(row).toJSON());

    return { data, total };
  }

  async findAllWithoutPermissions({
    page,
    limit,
    search,
  }: TQueryRequest): Promise<TFindAllResponse<TRoleType>> {
    const offset = (page - 1) * limit;
    let query = "SELECT id, nome, descricao, ativo, created_at, updated_at FROM roles";
    let countQuery = "SELECT COUNT(*) AS total FROM roles";
    const values: (string | number)[] = [];

    if (search) {
      query += ` WHERE nome ILIKE $1 OR descricao ILIKE $1`;
      countQuery += ` WHERE nome ILIKE $1 OR descricao ILIKE $1`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [result, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const data = result.rows.map((row) => new Role(row).toJSON());

    return { data, total };
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: UpdateRoleInput;
  }): Promise<TRoleType> {
    const values: (string | boolean | TRolePermission[] | string)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<keyof UpdateRoleInput, string> = {
      nome: "nome",
      descricao: "descricao",
      permissions: "permissions",
      ativo: "ativo",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key as keyof UpdateRoleInput]) {
        fields.push(`${fieldMapping[key as keyof UpdateRoleInput]} = $${counter}`);
        if (key === "permissions") {
          values.push(JSON.stringify(value)); 
        } else {
          values.push(value);
        }
        counter++;
      }
    }

    fields.push(`updated_at = NOW()`);

    values.push(id);
    const query = `
      UPDATE roles
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (!result.rows[0]) {
      throw new NotFoundException("Role não encontrada para atualização", "RoleRepository");
    }

    return new Role(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<void> {
    await db.query("DELETE FROM roles WHERE id = $1", [id]);
  }

  async findByPermission(permissionKey: string): Promise<TRoleType[]> {
    const query = `
      SELECT * FROM roles
      WHERE permissions::jsonb @> '[{"key": $1, "allowed": true}]'
      AND ativo = true
    `;
    const result = await db.query(query, [permissionKey]);
    return result.rows.map((row) => new Role(row).toJSON());
  }

  async bulkUpdatePermissions(
    updates: { id: string; permissions: TRolePermission[] }[]
  ): Promise<void> {
    if (updates.length === 0) return;

    const queries = updates.map(({ id, permissions }) => {
      return db.query(
        `
        UPDATE roles
        SET permissions = $1::jsonb, updated_at = NOW()
        WHERE id = $2
        `,
        [JSON.stringify(permissions), id]
      );
    });

    await Promise.all(queries);
  }

  async checkIfRoleIsInUse(roleId: string): Promise<boolean> {
    const result = await db.query("SELECT COUNT(*) FROM users WHERE role_id = $1", [roleId]);
    return parseInt(result.rows[0].count, 10) > 0;
  }
}

export default RoleRepository;
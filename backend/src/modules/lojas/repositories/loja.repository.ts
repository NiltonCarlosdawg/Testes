import db from "@/config/database.js";
import { TCreateLojaInput, TUpdateLojaInput } from "../schemas/loja.schema.js";
import { ILojaRepository, StatusLoja, TLojaResponse } from "../types/loja.types.js";
import { Loja } from "../models/loja.model.js";
import { TFindAllResponse } from "@/types/query.types.js";

export class LojaRepository implements ILojaRepository {
  private db: typeof db
  constructor(dbInstance: typeof db = db){
    this.db = dbInstance
  }
  async create(data: TCreateLojaInput, donoId: string): Promise<string> {
    const query = `
      INSERT INTO lojas (
        dono_id, nome, descricao, logo_url, banner_url, status,
        documento_identificacao, email_comercial, telefone_comercial,
        endereco_comercial, aprovado_por, aprovado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    const values = [
      donoId,
      data.nome,
      data.descricao,
      data.logoUrl,
      data.bannerUrl,
      data.status || StatusLoja.PENDENTE,
      data.documentoIdentificacao,
      data.emailComercial,
      data.telefoneComercial,
      data.enderecoComercial ? JSON.stringify(data.enderecoComercial) : null,
      data.aprovadoPor,
      data.aprovadoEm,
    ];
    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  async AprovarLoja(id: string, aprovadoPor: string): Promise<TLojaResponse>{
    const query = `
      UPDATE lojas 
      SET status = $1, 
      aprovado_por = $2, 
      aprovado_em = $3 
      WHERE id = $4 RETURNING *
    `
    const values = [
      StatusLoja.APROVADO,
      aprovadoPor,
      new Date(),
      id
    ]
    const result = await this.db.query(query, values)
    return new Loja(result.rows[0]).toJSON()
  }

  async findById(id: string): Promise<TLojaResponse | null> {
    const result = await this.db.query("SELECT * FROM lojas WHERE id = $1", [id]);
    return result.rows[0] ? new Loja(result.rows[0]).toJSON() : null;
  }

  async findByNome(nome: string): Promise<TLojaResponse | null> {
    const result = await this.db.query("SELECT * FROM lojas WHERE nome = $1", [
      nome,
    ]);
    return result.rows[0] ? new Loja(result.rows[0]).toJSON() : null;
  }

  async findByDonoId(donoId: string): Promise<TLojaResponse[]> {
    const result = await this.db.query("SELECT * FROM lojas WHERE dono_id = $1", [
      donoId,
    ]);
    return result.rows.map((row) => new Loja(row).toJSON());
  }

  async getAll({
    page,
    limit,
    search,
    status, 
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }): Promise<TFindAllResponse<TLojaResponse>> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM lojas";
    let countQuery = "SELECT COUNT(*) AS total FROM lojas";
    const values: (string | number)[] = [];
    let paramIndex = 1;

    const conditions: string[] = [];

    if (search) {
      conditions.push(`(nome ILIKE $${paramIndex} OR descricao ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      const whereClause = conditions.join(" AND ");
      query += ` WHERE ${whereClause}`;
      countQuery += ` WHERE ${whereClause}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, values),
      this.db.query(countQuery, values.slice(0, values.length - 2)),
    ]);

    const data = dataRes.rows.map((row) => new Loja(row).toJSON());
    const total = parseInt(countRes.rows[0].total, 10);

    return { data, total };
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: TUpdateLojaInput;
  }): Promise<TLojaResponse> {
    const values: (string | Date | object | null)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      donoId: "dono_id",
      nome: "nome",
      descricao: "descricao",
      logoUrl: "logo_url",
      bannerUrl: "banner_url",
      status: "status",
      documentoIdentificacao: "documento_identificacao",
      emailComercial: "email_comercial",
      telefoneComercial: "telefone_comercial",
      enderecoComercial: "endereco_comercial",
      aprovadoPor: "aprovado_por",
      aprovadoEm: "aprovado_em",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(
          key === "enderecoComercial" ? JSON.stringify(value) : value
        );
        counter++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE lojas
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;
    const result = await this.db.query(query, values);

    if (!result.rows[0]) {
      throw new Error("Update failed: loja not found or no changes made");
    }

    return new Loja(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<void> {
    await this.db.query("UPDATE lojas SET status = $1 WHERE id = $2", [StatusLoja.SUSPENSA, id]);
  }
}

export default LojaRepository;

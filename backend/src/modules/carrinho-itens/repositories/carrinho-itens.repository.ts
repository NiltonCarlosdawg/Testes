import db from "@/config/database.js";
import {
  TCreateCarrinhoItemInput,
  TUpdateCarrinhoItemInput,
} from "../schemas/carrinho-itens.schema.js";
import {
  ICarrinhoItemRepository,
  TCarrinhoItemResponse,
  TCarrinhoItemWithProductResponse,
} from "../types/carrinho-itens.types.js";
import { CarrinhoItem } from "../models/carrinho-itens.model.js";
import { TQueryRequest } from "@/types/query.types.js";

export class CarrinhoItemRepository implements ICarrinhoItemRepository {
  private db: typeof db;

  constructor(dbInstance: typeof db = db) {
    this.db = dbInstance;
  }

  async create(data: TCreateCarrinhoItemInput): Promise<string> {
    const query = `
      INSERT INTO carrinho_itens (
        user_id, produto_id, variacao_id, quantidade
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [
      data.userId,
      data.produtoId,
      data.variacaoId,
      data.quantidade,
    ];
    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  async findById(id: string): Promise<TCarrinhoItemResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM carrinho_itens WHERE id = $1",
      [id]
    );
    return result.rows[0] ? new CarrinhoItem(result.rows[0]).toJSON() : null;
  }

  async findByUserIdWithProducts(
    userId: string
  ): Promise<TCarrinhoItemWithProductResponse[]> {
    const query = `
      SELECT 
        ci.id,
        ci.user_id AS "userId",
        ci.produto_id AS "produtoId",
        ci.variacao_id AS "variacaoId",
        ci.quantidade,
        ci.created_at AS "createdAt",
        ci.updated_at AS "updatedAt",

        -- Produto
        p.titulo AS "produtoTitulo",
        p.descricao AS "produtoDescricao",
        p.preco AS "produtoPreco",
        p.preco_original AS "produtoPrecoOriginal",

        -- Imagens agregadas
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'textoAlternativo', pi.texto_alternativo,
              'posicao', pi.posicao,
              'isPrincipal', pi.is_principal
            ) ORDER BY pi.posicao ASC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) AS "produtoImagens",

        -- Variação
        pv.nome AS "variacaoNome",
        pv.sku AS "variacaoSku",
        pv.preco_adicional AS "variacaoPrecoAdicional",
        pv.quantidade_estoque AS "variacaoEstoque",
        pv.atributos AS "variacaoAtributos"

      FROM carrinho_itens ci
      INNER JOIN produtos p ON ci.produto_id = p.id AND p.ativo = true
      LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
      LEFT JOIN produto_variacoes pv ON ci.variacao_id = pv.id

      WHERE ci.user_id = $1
      GROUP BY 
        ci.id, p.id, pv.id
      ORDER BY ci.created_at DESC
    `;

    const result = await this.db.query(query, [userId]);

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      produtoId: row.produtoId,
      variacaoId: row.variacaoId,
      quantidade: row.quantidade,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      produto: {
        id: row.produtoId,
        titulo: row.produtoTitulo,
        descricao: row.produtoDescricao,
        preco: parseFloat(row.produtoPreco),
        precoOriginal: row.produtoPrecoOriginal
          ? parseFloat(row.produtoPrecoOriginal)
          : null,
        imagens: row.produtoImagens,
      },
      variacao: row.variacaoId
        ? {
            id: row.variacaoId,
            nome: row.variacaoNome,
            sku: row.variacaoSku,
            precoAdicional: row.variacaoPrecoAdicional
              ? parseFloat(row.variacaoPrecoAdicional)
              : null,
            quantidadeEstoque: row.variacaoEstoque,
            atributos: row.variacaoAtributos || {},
          }
        : null,
    }));
  }

  async findByUserId(userId: string): Promise<TCarrinhoItemResponse[]> {
    const result = await this.db.query(
      "SELECT * FROM carrinho_itens WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows.map((row) => new CarrinhoItem(row).toJSON());
  }

  async findByUserProdutoVariacao(params: {
    userId: string;
    produtoId: string;
    variacaoId: string | null;
  }): Promise<TCarrinhoItemResponse | null> {
    const { userId, produtoId, variacaoId } = params;
    let query =
      "SELECT * FROM carrinho_itens WHERE user_id = $1 AND produto_id = $2";
    const values: (string | null)[] = [userId, produtoId];

    if (variacaoId) {
      query += " AND variacao_id = $3";
      values.push(variacaoId);
    } else {
      query += " AND variacao_id IS NULL";
    }

    const result = await this.db.query(query, values);
    return result.rows[0] ? new CarrinhoItem(result.rows[0]).toJSON() : null;
  }

  async getAll({
    page = 1,
    limit = 10,
  }: TQueryRequest): Promise<{ data: TCarrinhoItemResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    const query =
      "SELECT * FROM carrinho_itens ORDER BY created_at DESC LIMIT $1 OFFSET $2";
    const countQuery = "SELECT COUNT(*) AS total FROM carrinho_itens";

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, [limit, offset]),
      this.db.query(countQuery, []),
    ]);

    const data = dataRes.rows.map((row) => new CarrinhoItem(row).toJSON());
    const total = parseInt(countRes.rows[0].total, 10);

    return { data, total };
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: TUpdateCarrinhoItemInput;
  }): Promise<TCarrinhoItemResponse> {
    if (data.quantidade === undefined) {
      throw new Error("Nenhuma quantidade fornecida para atualização.");
    }

    const query = `
      UPDATE carrinho_itens
      SET quantidade = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const values = [data.quantidade, id];
    const result = await this.db.query(query, values);

    if (!result.rows[0]) {
      throw new Error(
        "Falha na atualização: Item do carrinho não encontrado."
      );
    }

    return new CarrinhoItem(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.query(
      "DELETE FROM carrinho_itens WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("Falha ao deletar: Item não encontrado.");
    }
  }
}
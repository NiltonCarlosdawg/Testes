import db from "@/config/database.js";
import {
  TCreateProdutoInput,
  TUpdateProdutoInput,
} from "../schemas/produto.schema.js";
import {
  IProdutoRepository,
  TProdutoImagemDbRow,
  TProdutoResponse,
} from "../types/produto.types.js";
import { TQueryRequest } from "@/types/query.types.js";
import { DatabaseException } from "@/utils/domain.js";
import { Produto } from "../models/produto.model.js";
import { ProdutoImagem } from "../models/produto-imagem.model.js";
import { TransactionManager } from "@/utils/create-transaction.js";

export interface TFilterParams {
  categories?: string[];
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  genders?: string[];
  ageGroups?: string[];
  conditions?: string[];
  price?: { min: number; max: number };
  sortBy?: string;
  inStock?: boolean;
  tags?: string[];
}


export class ProdutoRepository implements IProdutoRepository {
  private db: typeof db;

  constructor(dbInstance: typeof db = db) {
    this.db = dbInstance;
  }

  async create(data: TCreateProdutoInput): Promise<string> {
    const { images, ...produtoFields } = data;

    const productQuery = `
      INSERT INTO produtos (
        loja_id, titulo, descricao, categoria_id, preco,
        marca, modelo, condicao, quantidade_estoque, quantidade_minima,
        permite_pedido_sem_estoque, sku, codigo_barras, peso_kg, altura_cm,
        largura_cm, ativo, tamanho, cor, material, genero, idade_grupo,
         tags, atributos
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22,
        $23, $24
      )
      RETURNING id
    `;

    const productValues: (string | number | boolean | object | null)[] = [
      produtoFields.lojaId,
      produtoFields.titulo,
      produtoFields.descricao,
      produtoFields.categoriaId ?? null,
      produtoFields.preco,
      produtoFields.marca ?? null,
      produtoFields.modelo ?? null,
      produtoFields.condicao ?? "novo_com_etiqueta",
      produtoFields.quantidadeEstoque ?? 0,
      produtoFields.quantidadeMinima ?? 1,
      produtoFields.permitePedidoSemEstoque ?? false,
      produtoFields.sku ?? null,
      produtoFields.codigoBarras ?? null,
      produtoFields.pesoKg ?? null,
      produtoFields.alturaCm ?? null,
      produtoFields.larguraCm ?? null,
      produtoFields.ativo ?? true,
      produtoFields.tamanho ?? null,
      produtoFields.cor ?? null,
      produtoFields.material ?? null,
      produtoFields.genero ?? null,
      produtoFields.idadeGrupo ?? null,
      produtoFields.tags ?? null,
      produtoFields.atributos ?? null,
    ];

    const client = await this.db.pool.connect();
    try {
      await client.query("BEGIN");

      const productResult = await client.query<{ id: string }>(
        productQuery,
        productValues
      );
      const productId = productResult.rows[0]?.id;

      if (!productId) {
        throw new DatabaseException(
          "Falha ao criar o produto, nenhum ID retornado."
        );
      }

      const imageQuery = `
        INSERT INTO produto_imagens (produto_id, url, texto_alternativo, posicao, is_principal)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const image of images) {
        const imageValues = [
          productId,
          image.url,
          image.altText ?? null,
          image.position,
          image.isPrincipal,
        ];
        await client.query(imageQuery, imageValues);
      }

      await client.query("COMMIT");
      return productId;
    } catch (error) {
      await client.query("ROLLBACK");
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode =
        error && typeof error === "object" && "code" in error
          ? error.code
          : null;

      console.error("Error in ProdutoRepository.create:", {
        error: errorMessage,
        code: errorCode,
      });
      throw new DatabaseException(errorMessage);
    } finally {
      client.release();
    }
  }


  async findById(id: string): Promise<TProdutoResponse | null> {
    const produtoQuery = `
      SELECT * 
      FROM produtos 
      WHERE id = $1 AND ativo = true
    `;
    const produtoResult = await this.db.query(produtoQuery, [id]);
    if (produtoResult.rows.length === 0) return null;

    const produto = new Produto(produtoResult.rows[0]).toJSON();

    const imagensQuery = `
      SELECT 
        id,
        url,
        texto_alternativo AS "textoAlternativo",
        posicao,
        is_principal AS "isPrincipal"
      FROM produto_imagens
      WHERE produto_id = $1
      ORDER BY posicao ASC
    `;
    const imagensResult = await this.db.query(imagensQuery, [id]);
    const imagens = imagensResult.rows.map((row: TProdutoImagemDbRow) =>
      new ProdutoImagem(row).toJSON()
    );

    return {
      ...produto,
      imagens,
    };
  }

  async findByLoja(lojaId: string): Promise<TProdutoResponse[]> {
    const query = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'url', pi.url,
            'textoAlternativo', pi.texto_alternativo,
            'posicao', pi.posicao,
            'isPrincipal', pi.is_principal
          ) ORDER BY pi.posicao ASC
        ) AS imagens
      FROM produtos p
      LEFT JOIN produto_imagens pi ON pi.produto_id = p.id
      WHERE p.loja_id = $1 AND p.ativo = true
      GROUP BY p.id
    `;
    const result = await this.db.query(query, [lojaId]);

    return result.rows.map((row) => ({
      ...new Produto(row).toJSON(),
      imagens: row.imagens
        ? row.imagens.map((img: TProdutoImagemDbRow) =>
            new ProdutoImagem(img).toJSON()
          )
        : [],
    }));
  }

  async findByCategoria(categoriaId: string): Promise<TProdutoResponse[]> {
    const query = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'url', pi.url,
            'textoAlternativo', pi.texto_alternativo,
            'posicao', pi.posicao,
            'isPrincipal', pi.is_principal
          ) ORDER BY pi.posicao ASC
        ) AS imagens
      FROM produtos p
      LEFT JOIN produto_imagens pi ON pi.produto_id = p.id
      WHERE p.categoria_id = $1 AND p.ativo = true
      GROUP BY p.id
    `;
    const result = await this.db.query(query, [categoriaId]);

    return result.rows.map((row) => ({
      ...new Produto(row).toJSON(),
      imagens: row.imagens
        ? row.imagens.map((img: TProdutoImagemDbRow) =>
            new ProdutoImagem(img).toJSON()
          )
        : [],
    }));
  }

  async getAll({
    page = 1,
    limit = 10,
    search,
    filters,
  }: TQueryRequest & { filters?: TFilterParams }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        p.*,
        COALESCE(json_agg(
          json_build_object(
            'id', pi.id, 'url', pi.url, 'textoAlternativo', pi.texto_alternativo,
            'posicao', pi.posicao, 'isPrincipal', pi.is_principal
          ) ORDER BY pi.posicao
        ) FILTER (WHERE pi.id IS NOT NULL), '[]') AS imagens
      FROM produtos p
      LEFT JOIN produto_imagens pi ON pi.produto_id = p.id
      WHERE p.ativo = true
    `;

    let countQuery = `SELECT COUNT(DISTINCT p.id) FROM produtos p WHERE p.ativo = true`;
    const values: any[] = [];
    const countValues: any[] = [];

    if (search) {
      const param = `%${search}%`;
      query += ` AND (p.titulo ILIKE $${values.length + 1} OR p.descricao ILIKE $${values.length + 1})`;
      countQuery += ` AND (p.titulo ILIKE $${countValues.length + 1} OR p.descricao ILIKE $${countValues.length + 1})`;
      values.push(param); countValues.push(param);
    }

    if (filters) {
      if (filters.categories?.length) {
        query += ` AND p.categoria_id = ANY($${values.length + 1}::uuid[])`;
        countQuery += ` AND p.categoria_id = ANY($${countValues.length + 1}::uuid[])`;
        values.push(filters.categories); countValues.push(filters.categories);
      }
      if (filters.brands?.length) {
        query += ` AND p.marca = ANY($${values.length + 1})`;
        countQuery += ` AND p.marca = ANY($${countValues.length + 1})`;
        values.push(filters.brands); countValues.push(filters.brands);
      }
      if (filters.colors?.length) {
        query += ` AND p.cor = ANY($${values.length + 1})`;
        countQuery += ` AND p.cor = ANY($${countValues.length + 1})`;
        values.push(filters.colors); countValues.push(filters.colors);
      }
      if (filters.sizes?.length) {
        query += ` AND p.tamanho = ANY($${values.length + 1})`;
        countQuery += ` AND p.tamanho = ANY($${countValues.length + 1})`;
        values.push(filters.sizes); countValues.push(filters.sizes);
      }
      if (filters.materials?.length) {
        query += ` AND p.material = ANY($${values.length + 1})`;
        countQuery += ` AND p.material = ANY($${countValues.length + 1})`;
        values.push(filters.materials); countValues.push(filters.materials);
      }
      if (filters.genders?.length) {
        query += ` AND p.genero = ANY($${values.length + 1})`;
        countQuery += ` AND p.genero = ANY($${countValues.length + 1})`;
        values.push(filters.genders); countValues.push(filters.genders);
      }
      if (filters.ageGroups?.length) {
        query += ` AND p.idade_grupo = ANY($${values.length + 1})`;
        countQuery += ` AND p.idade_grupo = ANY($${countValues.length + 1})`;
        values.push(filters.ageGroups); countValues.push(filters.ageGroups);
      }
      if (filters.conditions?.length) {
        query += ` AND p.condicao = ANY($${values.length + 1})`;
        countQuery += ` AND p.condicao = ANY($${countValues.length + 1})`;
        values.push(filters.conditions); countValues.push(filters.conditions);
      }
      if (filters.price) {
        query += ` AND p.preco BETWEEN $${values.length + 1} AND $${values.length + 2}`;
        countQuery += ` AND p.preco BETWEEN $${countValues.length + 1} AND $${countValues.length + 2}`;
        values.push(filters.price.min, filters.price.max);
        countValues.push(filters.price.min, filters.price.max);
      }
      if (filters.inStock) {
        query += ` AND p.quantidade_estoque > 0`;
        countQuery += ` AND p.quantidade_estoque > 0`;
      }
      if (filters.tags?.length) {
        query += ` AND EXISTS (SELECT 1 FROM jsonb_array_elements(p.tags) AS t WHERE t::text ILIKE ANY (ARRAY[${Array(filters.tags.length).fill(0).map((_, i) => `$${values.length + 1 + i}`).join(', ')}]))`;
        values.push(...filters.tags.map(t => `%${t}%`));
      }
    }

    query += ` GROUP BY p.id`;

    const sortMap: Record<string, string> = {
      newest: "p.created_at DESC",
      "price-low-high": "p.preco ASC",
      "price-high-low": "p.preco DESC",
      popular: "p.vendas_total DESC",
      views: "p.visualizacoes DESC",
    };
    query += ` ORDER BY ${sortMap[filters?.sortBy || ''] || 'p.created_at DESC'}`;
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, values),
      this.db.query(countQuery, countValues),
    ]);

    const data = dataRes.rows.map(row => ({
      ...new Produto(row).toJSON(),
      imagens: row.imagens.map((img: any) => new ProdutoImagem(img).toJSON()),
    }));

    const total = parseInt(countRes.rows[0]?.total || '0', 10);
    return { data, total };
  }

  async getFilterOptions() {
    const [
      categoriesRes,
      brandsRes,
      colorsRes,
      sizesRes,
      materialsRes,
      gendersRes,
      ageGroupsRes,
      conditionsRes,
      priceRes
    ] = await Promise.all([
      this.db.query(`SELECT id, nome FROM categorias WHERE ativo = true ORDER BY nome`),
      this.db.query(`SELECT DISTINCT marca FROM produtos WHERE marca IS NOT NULL AND ativo = true ORDER BY marca`),
      this.db.query(`SELECT DISTINCT cor FROM produtos WHERE cor IS NOT NULL AND ativo = true ORDER BY cor`),
      this.db.query(`SELECT DISTINCT tamanho FROM produtos WHERE tamanho IS NOT NULL AND ativo = true ORDER BY tamanho`),
      this.db.query(`SELECT DISTINCT material FROM produtos WHERE material IS NOT NULL AND ativo = true ORDER BY material`),
      this.db.query(`SELECT DISTINCT genero FROM produtos WHERE genero IS NOT NULL AND ativo = true ORDER BY genero`),
      this.db.query(`SELECT DISTINCT idade_grupo FROM produtos WHERE idade_grupo IS NOT NULL AND ativo = true ORDER BY idade_grupo`),
      this.db.query(`SELECT DISTINCT condicao FROM produtos WHERE condicao IS NOT NULL ORDER BY condicao`),

      this.db.query(`SELECT MIN(preco)::numeric AS min, MAX(preco)::numeric AS max FROM produtos WHERE ativo = true`),
    ]);

    return {
      categories: categoriesRes.rows,
      brands: brandsRes.rows.map(r => r.marca),
      colors: colorsRes.rows.map(r => r.cor),
      sizes: sizesRes.rows.map(r => r.tamanho),
      materials: materialsRes.rows.map(r => r.material),
      genders: gendersRes.rows.map(r => r.genero),
      ageGroups: ageGroupsRes.rows.map(r => r.idade_grupo),
      conditions: conditionsRes.rows.map(r => r.condicao),
      priceRange: {
        min: parseFloat(priceRes.rows[0].min) || 0,
        max: parseFloat(priceRes.rows[0].max) || 1000,
      },
    };
  }

  async getBySelection(
    selectionToken: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: TProdutoResponse[]; total: number }> {
    const offset = (page - 1) * limit;

    const selectionResult = await this.db.query(
      `SELECT produto_ids FROM produto_selections 
      WHERE token = $1 
      AND (expires_at IS NULL OR expires_at > NOW())`,
      [selectionToken]
    );

    if (!selectionResult.rows[0]?.produto_ids?.length) {
      return { data: [], total: 0 };
    }

    const produtoIds = selectionResult.rows[0].produto_ids;

    const query = `
      SELECT 
        p.*,
        COALESCE(json_agg(
          json_build_object(
            'id', pi.id, 
            'url', pi.url, 
            'textoAlternativo', pi.texto_alternativo,
            'posicao', pi.posicao, 
            'isPrincipal', pi.is_principal
          ) ORDER BY pi.posicao
        ) FILTER (WHERE pi.id IS NOT NULL), '[]') AS imagens
      FROM produtos p
      LEFT JOIN produto_imagens pi ON pi.produto_id = p.id
      WHERE p.ativo = true 
        AND p.id IN (${produtoIds.map((_: string, i: string) => `$${i + 1}`).join(', ')})
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${produtoIds.length + 1} 
      OFFSET $${produtoIds.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT p.id)::text as total 
      FROM produtos p 
      WHERE p.ativo = true 
        AND p.id IN (${produtoIds.map((_: string, i: string) => `$${i + 1}`).join(', ')})
    `;

    const values = [...produtoIds, limit, offset];
    const countValues = [...produtoIds];

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, values),
      this.db.query(countQuery, countValues),
    ]);

    const data: TProdutoResponse[] = dataRes.rows.map(row => ({
      ...new Produto(row).toJSON(),
      imagens: row.imagens.map((img: any) => new ProdutoImagem(img).toJSON()),
    }));

    const total = parseInt(countRes.rows[0]?.total || '0', 10);
    
    return { data, total };
  }

  async findByIdForUpdate(
    produtoId: string,
    tx: TransactionManager
  ): Promise<{ id: string; titulo: string; quantidadeEstoque: number; preco: number } | null> {
    const result = await tx.query(
      `SELECT id, titulo, quantidade_estoque, preco
       FROM produtos 
       WHERE id = $1 
       FOR UPDATE`,
      [produtoId]
    );

    return result.rows[0] ? {
      id: result.rows[0].id,
      titulo: result.rows[0].titulo,
      quantidadeEstoque: result.rows[0].quantidade_estoque,
      preco: Number(result.rows[0].preco)
    } : null
  }

  async updateQuantity(
    produtoId: string,
    novaQuantidade: number,
    tx?: TransactionManager
  ): Promise<void> {
    const query = 'UPDATE produtos SET quantidade_estoque = $1 WHERE id = $2';
    const params = [novaQuantidade, produtoId];

    if (tx) {
      await tx.query(query, params);
    } else {
      await db.query(query, params);
    }
  }

  async update(
    id: string,
    data: TUpdateProdutoInput
  ): Promise<TProdutoResponse> {
    const fields: string[] = [];
    const values: (string | number | boolean | object | null)[] = [];
    let counter = 1;

    const fieldsMapping: Record<string, string> = {
      lojaId: "loja_id",
      titulo: "titulo",
      descricao: "descricao",
      categoriaId: "categoria_id",
      preco: "preco",
      marca: "marca",
      modelo: "modelo",
      condicao: "condicao",
      quantidadeEstoque: "quantidade_estoque",
      quantidadeMinima: "quantidade_minima",
      permitePedidoSemEstoque: "permite_pedido_sem_estoque",
      sku: "sku",
      codigoBarras: "codigo_barras",
      pesoKg: "peso_kg",
      alturaCm: "altura_cm",
      larguraCm: "largura_cm",
      ativo: "ativo",
      tamanho: "tamanho",
      cor: "cor",
      material: "material",
      genero: "genero",
      idadeGrupo: "idade_grupo",
      visualizacoes: "visualizacoes",
      favoritosCount: "favoritos_count",
      vendasTotal: "vendas_total",
      tags: "tags",
      atributos: "atributos",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldsMapping[key]) {
        fields.push(`${fieldsMapping[key]} = $${counter}`);
        values.push(value);
        counter++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE produtos
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (!result.rows[0]) {
      throw new DatabaseException(
        "update failed: produto not found or no changes made"
      );
    }

    return new Produto(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      "UPDATE produtos SET ativo = false WHERE id = $1",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

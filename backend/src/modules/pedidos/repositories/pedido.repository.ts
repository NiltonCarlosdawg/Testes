import db from "@/config/database.js";
import { TCreatePedidoInput, TUpdatePedidoInput } from "../schemas/pedido.schema.js";
import {
  IPedidoRepository,
  TPedidoDbRow,
  TPedidoResponse,
  StatusPedido,
  TPedidoItemResponse,
  TPedidoItemDbRow,
  TDashboardStats,
  TMonthlyRevenue,
  TTopProduto,
  StatusPagamento,
} from "../types/pedido.types.js";
import { Pedido, PedidoItem } from "../models/pedido.model.js";
import { DatabaseException } from "@/utils/domain.js";
import { TQueryRequest } from "@/types/query.types.js";
import { TransactionManager } from "@/utils/create-transaction.js";
import { logger } from "@/utils/logger.js";

export class PedidoRepository implements IPedidoRepository {
  private db: typeof db;

  constructor(dbInstance: typeof db = db) {
    this.db = dbInstance;
  }

 async create(
    data: TCreatePedidoInput,
    numeroPedido: string,
    tx?: TransactionManager 
  ): Promise<string> {
    try {
      const pedidoQuery = `
        INSERT INTO pedidos (
          numero_pedido, comprador_id, loja_id, subtotal, 
          valor_frete, desconto, total, metodo_pagamento_id, 
          status_pagamento, status, endereco_entrega, observacoes_comprador
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `;

      const pedidoValues = [
        numeroPedido,
        data.compradorId,
        data.lojaId,
        data.subtotal,
        data.valorFrete,
        data.desconto,
        data.total,
        data.metodoPagamentoId,
        data.statusPagamento,
        data.status,
        JSON.stringify(data.enderecoEntrega),
        data.observacoesComprador,
      ];

      const pedidoResult = tx
        ? await tx.query(pedidoQuery, pedidoValues)
        : await this.db.query(pedidoQuery, pedidoValues);

      const pedidoId = pedidoResult.rows[0].id;

      if (data.itens.length > 0) {
        const itensQuery = `
          INSERT INTO pedido_itens (
            pedido_id, produto_id, variacao_id, titulo, 
            preco, quantidade, subtotal, imagem_url
          ) VALUES
        `;

        const allItemValues: unknown[] = [];
        let paramCounter = 1;
        const valuePlaceholders: string[] = [];

        data.itens.forEach((item) => {
          const placeholders = Array.from(
            { length: 8 },
            (_, i) => `$${paramCounter + i}`
          );
          paramCounter += 8;

          valuePlaceholders.push(`(${placeholders.join(', ')})`);

          allItemValues.push(
            pedidoId,
            item.produtoId,
            item.variacaoId ?? null,
            item.titulo,
            item.preco,
            item.quantidade,
            item.subtotal,
            item.imagemUrl ?? null
          );
        });

        const fullQuery = itensQuery + valuePlaceholders.join(', ');

        if (tx) {
          await tx.query(fullQuery, allItemValues);
        } else {
          await this.db.query(fullQuery, allItemValues);
        }
      }

      return pedidoId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode =
        error && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : null;

      logger.error('Error in PedidoRepository.create:', {
        error: errorMessage,
        code: errorCode,
      });

      throw new DatabaseException(errorMessage);
    }
  }

  async findItensByPedidoId(pedidoId: string): Promise<TPedidoItemResponse[]> {
    const result = await this.db.query(
      "SELECT * FROM pedido_itens WHERE pedido_id = $1 ORDER BY created_at ASC",
      [pedidoId]
    );
    return result.rows.map((row) => new PedidoItem(row as TPedidoItemDbRow).toJSON());
  }

  async findLastOrder(): Promise<{ numeroPedido: string } | null> {
    const result = await this.db.query(
      "SELECT numero_pedido FROM pedidos ORDER BY created_at DESC LIMIT 1"
    );
    return result.rows[0] ? { numeroPedido: result.rows[0].numero_pedido } : null;
  }

  async findById(id: string): Promise<TPedidoResponse | null> {
    const result = await this.db.query(
      "SELECT * FROM pedidos WHERE id = $1 AND status != $2",
      [id, StatusPedido.CANCELADO]
    );

    if (!result.rows[0]) {
      return null;
    }

    const pedido = new Pedido(result.rows[0]).toJSON();
    const itens = await this.findItensByPedidoId(id);

    return { ...pedido, itens };
  }

  async findByCompradorId(compradorId: string): Promise<TPedidoResponse[]> {
    const result = await this.db.query(
      "SELECT * FROM pedidos WHERE comprador_id = $1 AND status != $2 ORDER BY created_at DESC",
      [compradorId, StatusPedido.CANCELADO]
    );
    return result.rows.map((row:TPedidoDbRow) => new Pedido(row).toJSON());
  }
  
  async findByLojaId(lojaId: string, { page = 1, limit = 10 }: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT * FROM pedidos 
      WHERE loja_id = $1 AND status != $2 
      ORDER BY created_at DESC 
      LIMIT $3 OFFSET $4
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM pedidos 
      WHERE loja_id = $1 AND status != $2
    `;

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, [lojaId, StatusPedido.CANCELADO, limit, offset]),
      this.db.query(countQuery, [lojaId, StatusPedido.CANCELADO]),
    ]);

    const data = dataRes.rows.map((row:TPedidoDbRow) => new Pedido(row).toJSON());
    const total = parseInt((countRes.rows[0]).total, 10);

    return { data, total };
  }

  async getAll({ page = 1, limit = 10, search }: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM pedidos WHERE status != $1";
    let countQuery = "SELECT COUNT(*) AS total FROM pedidos WHERE status != $1";
    const values: (string | number)[] = [StatusPedido.CANCELADO];
    const countValues: (string | number)[] = [StatusPedido.CANCELADO];

    if (search) {
      const searchClause = ` AND (numero_pedido ILIKE $2)`;
      query += searchClause;
      countQuery += searchClause;
      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, values),
      this.db.query(countQuery, countValues),
    ]);

    const data = dataRes.rows.map((row:TPedidoDbRow) => new Pedido(row).toJSON());
    const total = parseInt((countRes.rows[0]).total, 10);

    return { data, total };
  }

  async update({ id, data }: { id: string; data: TUpdatePedidoInput }): Promise<TPedidoResponse> {
    const values: (string | Date | null | undefined)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      codigoRastreio: "codigo_rastreio",
      transportadora: "transportadora",
      previsaoEntrega: "previsao_entrega",
      observacoesVendedor: "observacoes_vendedor",
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(key === "previsaoEntrega" ? new Date(value) : value);
        counter++;
      }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, StatusPedido.CANCELADO);

    const query = `
      UPDATE pedidos
      SET ${fields.join(", ")}
      WHERE id = $${counter} AND status != $${counter + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (!result.rows[0]) {
      throw new Error("Update failed: Pedido não encontrado ou já cancelado.");
    }

    return new Pedido(result.rows[0]).toJSON();
  }

  async delete(id: string): Promise<void> {
    await this.db.query(
      "UPDATE pedidos SET status = $1, cancelado_em = NOW(), updated_at = NOW() WHERE id = $2",
      [StatusPedido.CANCELADO, id]
    );
  }

  async updateStatus(
    id: string,
    status: StatusPedido,
    statusPagamento?: StatusPagamento,
    extraData: Record<string, any> = {}
  ): Promise<TPedidoResponse> {
    const fields: string[] = [];
    const values: (string | Date | null | undefined)[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      motivoCancelamento: "motivo_cancelamento",
      codigoRastreio: "codigo_rastreio",
      transportadora: "transportadora",
      referenciaPagamento: "referencia_pagamento",
    };

    fields.push(`status = $${counter}`);
    values.push(status);
    counter++;

    if (statusPagamento) {
      fields.push(`status_pagamento = $${counter}`);
      values.push(statusPagamento);
      counter++;
    }

    if (status === StatusPedido.CONFIRMADO) fields.push(`confirmado_em = NOW()`);
    if (statusPagamento === StatusPagamento.PAGO) fields.push(`pago_em = NOW()`);
    if (status === StatusPedido.ENVIADO) fields.push(`enviado_em = NOW()`);
    if (status === StatusPedido.ENTREGUE) fields.push(`entregue_em = NOW()`);
    if (status === StatusPedido.CANCELADO) fields.push(`cancelado_em = NOW()`);

    for (const [key, value] of Object.entries(extraData)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(value);
        counter++;
      }
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE pedidos
      SET ${fields.join(", ")}
      WHERE id = $${counter}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (!result.rows[0]) {
      throw new Error("Update status failed: Pedido não encontrado.");
    }

    return new Pedido(result.rows[0]).toJSON();
  }

  async findForToday(lojaId: string, { page = 1, limit = 10 }: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const query = `
      SELECT * FROM pedidos 
      WHERE loja_id = $1 AND created_at >= $2 AND created_at <= $3 AND status != $4
      ORDER BY created_at DESC 
      LIMIT $5 OFFSET $6
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM pedidos 
      WHERE loja_id = $1 AND created_at >= $2 AND created_at <= $3 AND status != $4
    `;

    const values = [lojaId, todayStart, todayEnd, StatusPedido.CANCELADO];
    
    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, [...values, limit, offset]),
      this.db.query(countQuery, values),
    ]);

    const data = dataRes.rows.map((row) => new Pedido(row).toJSON());
    const total = parseInt((countRes.rows[0]).total, 10);

    return { data, total };
  }

  async findPendingShipment(lojaId: string, { page = 1, limit = 10 }: TQueryRequest): Promise<{ data: TPedidoResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    // Pedidos pendentes de envio são os PAGOS (ou CONFIRMADOS) mas AINDA NÃO ENVIADOS
    const statusList = [StatusPedido.CONFIRMADO, StatusPedido.EM_PREPARACAO];
    
    const query = `
      SELECT * FROM pedidos 
      WHERE loja_id = $1 
      AND status_pagamento = $2 
      AND status = ANY($3::text[])
      AND status != $4
      ORDER BY created_at ASC 
      LIMIT $5 OFFSET $6
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM pedidos 
      WHERE loja_id = $1 
      AND status_pagamento = $2 
      AND status = ANY($3::text[])
      AND status != $4
    `;

    const values = [lojaId, StatusPagamento.PAGO, statusList, StatusPedido.CANCELADO];

    const [dataRes, countRes] = await Promise.all([
      this.db.query(query, [...values, limit, offset]),
      this.db.query(countQuery, values),
    ]);
    
    const data = dataRes.rows.map((row) => new Pedido(row).toJSON());
    const total = parseInt((countRes.rows[0]).total, 10);

    return { data, total };
  }

  async getDashboardStats(lojaId: string): Promise<TDashboardStats> {
    const query = `
      SELECT
        COALESCE(SUM(CASE WHEN status_pagamento = $2 THEN total ELSE 0 END), 0) AS "faturamentoTotal",
        COUNT(*) AS "totalPedidos",
        COALESCE(SUM(CASE WHEN status = $3 THEN 1 ELSE 0 END), 0) AS "pedidosPendentes",
        COALESCE(SUM(CASE WHEN status_pagamento = $2 THEN 1 ELSE 0 END), 0) AS "pedidosPagos",
        COALESCE(SUM(CASE WHEN status = $4 THEN 1 ELSE 0 END), 0) AS "pedidosEnviados"
      FROM pedidos
      WHERE loja_id = $1 AND status != $5
    `;
    
    const result = await this.db.query(query, [
      lojaId,
      StatusPagamento.PAGO,
      StatusPedido.PENDENTE,
      StatusPedido.ENVIADO,
      StatusPedido.CANCELADO
    ]);

    const row = result.rows[0];

    return {
      faturamentoTotal: parseFloat(row.faturamentoTotal),
      totalPedidos: parseInt(row.totalPedidos, 10),
      pedidosPendentes: parseInt(row.pedidosPendentes, 10),
      pedidosPagos: parseInt(row.pedidosPagos, 10),
      pedidosEnviados: parseInt(row.pedidosEnviados, 10),
    };
  }

  async getMonthlyRevenue(lojaId: string): Promise<TMonthlyRevenue[]> {
    const query = `
      SELECT 
        date_trunc('month', pago_em) AS mes, 
        SUM(total) AS faturamento
      FROM pedidos 
      WHERE loja_id = $1 
        AND status_pagamento = $2 
        AND pago_em IS NOT NULL 
        AND pago_em >= date_trunc('year', NOW())
      GROUP BY mes 
      ORDER BY mes ASC
    `;
    
    const result = await this.db.query(query, [lojaId, StatusPagamento.PAGO]);
    
    return result.rows.map(row => ({
      mes: (row.mes).toISOString(),
      faturamento: parseFloat(row.faturamento)
    }));
  }

  async getTopSellingProducts(lojaId: string, limit: number = 10): Promise<TTopProduto[]> {
    const query = `
      SELECT 
        pi.produto_id, 
        pi.titulo, 
        SUM(pi.quantidade) AS total_vendido
      FROM pedido_itens pi
      JOIN pedidos p ON pi.pedido_id = p.id
      WHERE p.loja_id = $1 AND p.status != $2
      GROUP BY pi.produto_id, pi.titulo
      ORDER BY total_vendido DESC
      LIMIT $3
    `;
    
    const result = await this.db.query(query, [lojaId, StatusPedido.CANCELADO, limit]);

    return result.rows.map(row => ({
        produto_id: row.produto_id,
        titulo: row.titulo,
        total_vendido: parseInt(row.total_vendido, 10)
    }));
  }
}
import { pgTable, uuid, text, boolean, timestamp, numeric, integer, inet, jsonb, date, uniqueIndex, index, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// === ENUMS EXPANDIDOS ===
enum StatusPedido {
  PENDENTE = "pendente",
  CONFIRMADO = "confirmado",
  PREPARANDO = "preparando",
  ENVIADO = "enviado",
  ENTREGUE = "entregue",
  CANCELADO = "cancelado",
  DEVOLVIDO = "devolvido",
}

enum StatusLoja {
  APROVADO = "aprovado",
  PENDENTE = "pendente",
  ATIVA = "ativa",
  SUSPENSA = "suspensa",
  INATIVA = "inativa",
}

enum TipoEndereco {
  RESIDENCIAL = "residencial",
  COMERCIAL = "comercial",
  OUTRO = "outro",
}

enum CondicaoProduto {
  NOVO_COM_ETIQUETA = "novo_com_etiqueta",
  NOVO_SEM_ETIQUETA = "novo_sem_etiqueta",
  MUITO_BOM = "muito_bom",
  BOM = "bom",
  ACEITAVEL = "aceitavel",
  USADO = "usado",
  RECONDICIONADO = "recondicionado",
}

enum StatusPagamento {
  PENDENTE = "pendente",
  PAGO = "pago",
  FALHADO = "falhado",
  REEMBOLSADO = "reembolsado",
}

/**
 * Tabela de roles
 */
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
  nome: text("nome").notNull().unique(),
  descricao: text("descricao"),
  permissions: jsonb("permissions"),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de usuários
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  email: text('email').notNull().unique(),
  telefone: text('telefone'),
  passwordHash: text('password_hash').notNull(),
  primeiroNome: text('primeiro_nome').notNull(),
  ultimoNome: text('ultimo_nome').notNull(),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('ativo'),
  emailVerificado: boolean('email_verificado').default(false),
  telefoneVerificado: boolean('telefone_verificado').default(false),
  role: text('role').default('user'),
  ultimoLogin: date('ultimo_login'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

/**
 * Tabela de endereços
 */
export const enderecos = pgTable('enderecos', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nomeDestinatario: text('nome_destinatario').notNull(),
  telefoneContato: text('telefone_contato').notNull(),
  enderecoLinha1: text('endereco_linha1').notNull(),
  enderecoLinha2: text('endereco_linha2'),
  bairro: text('bairro'),
  cidade: text('cidade').notNull(),
  provincia: text('provincia').notNull(),
  codigoPostal: text('codigo_postal'),
  pontoReferencia: text('ponto_referencia'),
  isPadrao: boolean('is_padrao').default(false),
  tipo: text('tipo').$type<TipoEndereco>().notNull().default(TipoEndereco.RESIDENCIAL),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("enderecos_user_id_idx").on(table.userId),
}));

/**
 * Tabela de sessões de usuários
 */
export const sessoesUsuarios = pgTable('sessoes_usuarios', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  deviceInfo: jsonb("device_info"),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ultimaAtividadeEm: timestamp('ultima_atividade_em', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenIdx: uniqueIndex("sessoes_token_idx").on(table.token),
}));

/**
 * Tabela de lojas - COM CAMPOS DE AVALIAÇÃO E CONFIGURAÇÕES
 */
export const lojas = pgTable('lojas', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  donoId: uuid('dono_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  status: text('status').$type<StatusLoja>().notNull().default(StatusLoja.PENDENTE),
  documentoIdentificacao: text('documento_identificacao'),
  emailComercial: text('email_comercial'),
  telefoneComercial: text('telefone_comercial'),
  enderecoComercial: jsonb('endereco_comercial'),
  aprovadoPor: uuid('aprovado_por').references(() => users.id, { onDelete: 'set null' }),
  aprovadoEm: timestamp('aprovado_em', { withTimezone: true }),

  // AVALIAÇÕES E MÉTRICAS
  avaliacaoMedia: numeric('avaliacao_media', { precision: 3, scale: 2 }).default('0'),
  totalAvaliacoes: integer('total_avaliacoes').default(0),
  totalVendas: integer('total_vendas').default(0),
  tempoRespostaHoras: numeric('tempo_resposta_horas', { precision: 5, scale: 2 }),
  taxaEnvioRapido: numeric('taxa_envio_rapido', { precision: 5, scale: 2 }),

  // POLÍTICAS
  aceitaDevolucao: boolean('aceita_devolucao').default(true),
  prazoProcessamento: integer('prazo_processamento').default(3),
  politicaEnvio: text('politica_envio'),
  politicaDevolucao: text('politica_devolucao'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de categorias
 */
export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  descricao: text("descricao"),
  iconeUrl: text("icone_url"),
  ordem: integer("ordem").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  categoriaPaiId: uuid("categoria_pai_id"),
}, (table) => ({
  slugIdx: uniqueIndex("categorias_slug_idx").on(table.slug),
}));

/**
 * Tabela de produtos - COM FILTROS + ENGAGEMENT + SEO
 */
export const produtos = pgTable('produtos', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  lojaId: uuid('loja_id'),
  // .notNull().references(() => lojas.id, { onDelete: 'cascade' }),
  titulo: text('titulo').notNull(),
  descricao: text('descricao').notNull(),
  categoriaId: uuid('categoria_id').references(() => categorias.id, { onDelete: 'set null' }),
  preco: numeric('preco', { precision: 15, scale: 2 }).notNull(),
  precoOriginal: numeric('preco_original', { precision: 15, scale: 2 }),
  marca: text('marca'),
  modelo: text('modelo'),
  condicao: text('condicao').$type<CondicaoProduto>().notNull().default(CondicaoProduto.NOVO_COM_ETIQUETA),
  quantidadeEstoque: integer('quantidade_estoque').notNull().default(0),
  quantidadeMinima: integer('quantidade_minima').default(1),
  permitePedidoSemEstoque: boolean('permite_pedido_sem_estoque').default(false),
  sku: text('sku'),
  codigoBarras: text('codigo_barras'),
  pesoKg: numeric('peso_kg', { precision: 8, scale: 2 }),
  alturaCm: numeric('altura_cm', { precision: 8, scale: 2 }),
  larguraCm: numeric('largura_cm', { precision: 8, scale: 2 }),
  ativo: boolean('ativo').notNull().default(true),

  // FILTROS
  tamanho: text('tamanho'), // 'XS', 'S', 'M', 'L', 'XL'
  cor: text('cor'), // 'black', 'white', 'blue'
  material: text('material'), // 'cotton', 'leather'
  genero: text('genero'), // 'women', 'men', 'kids', 'unisex'
  idadeGrupo: text('idade_grupo'), // 'adult', 'kids', 'baby'

  // ENGAGEMENT
  visualizacoes: integer('visualizacoes').default(0),
  favoritosCount: integer('favoritos_count').default(0),
  vendasTotal: integer('vendas_total').default(0),

  // SEO & BUSCA
  tags: jsonb('tags'), // ['verão', 'casual', 'promoção']
  atributos: jsonb('atributos'), // { water_resistant: true }

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  lojaIdIdx: index("produtos_loja_id_idx").on(table.lojaId),
  categoriaIdIdx: index("produtos_categoria_id_idx").on(table.categoriaId),
  ativoIdx: index("produtos_ativo_idx").on(table.ativo),
  condicaoIdx: index("produtos_condicao_idx").on(table.condicao),
  precoIdx: index("produtos_preco_idx").on(table.preco),
  createdAtIdx: index("produtos_created_at_idx").on(table.createdAt),
}));

/**
 * Tabela de variações de produtos
 */
export const produtoVariacoes = pgTable('produto_variacoes', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  produtoId: uuid('produto_id').notNull().references(() => produtos.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  sku: text('sku'),
  precoAdicional: numeric('preco_adicional', { precision: 15, scale: 2 }).default('0'),
  quantidadeEstoque: integer('quantidade_estoque').notNull().default(0),
  atributos: jsonb('atributos'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de imagens de produtos
 */
export const produtoImagens = pgTable('produto_imagens', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  produtoId: uuid('produto_id').notNull().references(() => produtos.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  textoAlternativo: text('texto_alternativo'),
  posicao: integer('posicao').notNull().default(1),
  isPrincipal: boolean('is_principal').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de favoritos
 */
export const produtoFavoritos = pgTable('produto_favoritos', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  produtoId: uuid('produto_id').notNull().references(() => produtos.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueUserProduto: uniqueIndex('unique_user_produto_favorito').on(table.userId, table.produtoId),
}));

/**
 * Tabela de avaliações de loja
 */
export const lojaAvaliacoes = pgTable('loja_avaliacoes', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  lojaId: uuid('loja_id').notNull().references(() => lojas.id, { onDelete: 'cascade' }),
  avaliadorId: uuid('avaliador_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'set null' }),
  nota: integer('nota').notNull(), // 1-5
  comentario: text('comentario'),
  resposta: text('resposta'),
  respondidoEm: timestamp('respondido_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueAvaliacao: uniqueIndex('unique_loja_avaliacao').on(table.lojaId, table.avaliadorId, table.pedidoId),
}));

/**
 * Tabela de itens do pedido - CRÍTICA!
 */
export const pedidoItens = pgTable('pedido_itens', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  pedidoId: uuid('pedido_id').notNull().references(() => pedidos.id, { onDelete: 'cascade' }),
  produtoId: uuid('produto_id').notNull().references(() => produtos.id, { onDelete: 'restrict' }),
  variacaoId: uuid('variacao_id').references(() => produtoVariacoes.id, { onDelete: 'restrict' }),
  titulo: text('titulo').notNull(),
  preco: numeric('preco', { precision: 15, scale: 2 }).notNull(),
  quantidade: integer('quantidade').notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  imagemUrl: text('imagem_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de histórico de preços
 */
export const produtoHistoricoPrecos = pgTable('produto_historico_precos', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  produtoId: uuid('produto_id').notNull().references(() => produtos.id, { onDelete: 'cascade' }),
  precoAnterior: numeric('preco_anterior', { precision: 15, scale: 2 }).notNull(),
  precoNovo: numeric('preco_novo', { precision: 15, scale: 2 }).notNull(),
  motivo: text('motivo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de opções de filtros dinâmicos
 */
export const filtroOpcoes = pgTable('filtro_opcoes', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  categoriaId: uuid('categoria_id').references(() => categorias.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(), // 'size', 'color', 'brand'
  valor: text('valor').notNull(),
  label: text('label').notNull(),
  ordem: integer('ordem').default(0),
  ativo: boolean('ativo').default(true),
  metadata: jsonb('metadata'), // { hex: '#000000' }
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueTipoValor: uniqueIndex('unique_filtro_opcao').on(table.categoriaId, table.tipo, table.valor),
}));

/**
 * Tabela de mensagens (chat)
 */
export const mensagens = pgTable('mensagens', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  remetenteId: uuid('remetente_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  destinatarioId: uuid('destinatario_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'set null' }),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'set null' }),
  conteudo: text('conteudo').notNull(),
  lida: boolean('lida').default(false),
  lidaEm: timestamp('lida_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de cupons
 */
export const cupons = pgTable('cupons', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  codigo: text('codigo').notNull().unique(),
  lojaId: uuid('loja_id').references(() => lojas.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(), // 'percentual', 'fixo', 'frete_gratis'
  valor: numeric('valor', { precision: 15, scale: 2 }).notNull(),
  valorMinimo: numeric('valor_minimo', { precision: 15, scale: 2 }),
  usoMaximo: integer('uso_maximo'),
  usoTotal: integer('uso_total').default(0),
  validoDe: timestamp('valido_de', { withTimezone: true }).notNull(),
  validoAte: timestamp('valido_ate', { withTimezone: true }).notNull(),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Tabela de métodos de pagamento
 */
export const metodosPagamento = pgTable('metodos_pagamento', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  nome: text('nome').notNull(),
  codigo: text('codigo').notNull().unique(),
  descricao: text('descricao'),
  iconeUrl: text('icone_url'),
  taxaPercentual: numeric('taxa_percentual', { precision: 5, scale: 2 }).default('0'),
  taxaFixa: numeric('taxa_fixa', { precision: 10, scale: 2 }).default('0'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  codigoIdx: uniqueIndex("metodos_pagamento_codigo_idx").on(table.codigo),
}));

/**
 * Tabela de itens do carrinho
 */
export const carrinhoItens = pgTable('carrinho_itens', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  produtoId: uuid('produto_id').notNull().references(() => produtos.id, { onDelete: 'cascade' }),
  variacaoId: uuid('variacao_id').references(() => produtoVariacoes.id, { onDelete: 'cascade' }),
  quantidade: integer('quantidade').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueUserProdutoVariacao: uniqueIndex('unique_user_produto_variacao').on(table.userId, table.produtoId, table.variacaoId),
}));

/**
 * Tabela de pedidos
 */
export const pedidos = pgTable('pedidos', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  numeroPedido: text('numero_pedido').notNull().unique(),
  compradorId: uuid('comprador_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  lojaId: uuid('loja_id').notNull().references(() => lojas.id, { onDelete: 'restrict' }),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  valorFrete: numeric('valor_frete', { precision: 15, scale: 2 }).default('0'),
  desconto: numeric('desconto', { precision: 15, scale: 2 }).default('0'),
  total: numeric('total', { precision: 15, scale: 2 }).notNull(),
  metodoPagamentoId: uuid('metodo_pagamento_id').references(() => metodosPagamento.id),
  statusPagamento: text('status_pagamento').$type<StatusPagamento>().notNull().default(StatusPagamento.PENDENTE),
  referenciaPagamento: text('referencia_pagamento'),
  status: text('status').$type<StatusPedido>().notNull().default(StatusPedido.PENDENTE),
  enderecoEntrega: jsonb('endereco_entrega').notNull(),
  codigoRastreio: text('codigo_rastreio'),
  transportadora: text('transportadora'),
  previsaoEntrega: date('previsao_entrega'),
  observacoesComprador: text('observacoes_comprador'),
  observacoesVendedor: text('observacoes_vendedor'),
  motivoCancelamento: text('motivo_cancelamento'),
  confirmadoEm: timestamp('confirmado_em', { withTimezone: true }),
  pagoEm: timestamp('pago_em', { withTimezone: true }),
  enviadoEm: timestamp('enviado_em', { withTimezone: true }),
  entregueEm: timestamp('entregue_em', { withTimezone: true }),
  canceladoEm: timestamp('cancelado_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  numeroPedidoIdx: uniqueIndex("pedidos_numero_pedido_idx").on(table.numeroPedido),
  statusIdx: index("pedidos_status_idx").on(table.status),
}));

export const produtoSelections = pgTable( "produto_selections", {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  token: varchar("token", { length: 32 }).notNull().unique(),
  nome: varchar("nome", { length: 255 }),
  descricao: text("descricao"),
  produtoIds: uuid("produto_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

/**
 * Tabela de notificações
 */
export const notificacoes = pgTable('notificacoes', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(),
  prioridade: text('prioridade'),
  titulo: text('titulo').notNull(),
  mensagem: text('mensagem').notNull(),
  referenciaId: uuid('referencia_id'),
  referenciaTipo: text('referencia_tipo'),
  lida: boolean('lida').default(false),
  lidaEm: timestamp('lida_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("notificacoes_user_id_idx").on(table.userId),
}));


export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionId: uuid("session_id")
      .references(() => sessoesUsuarios.id, { onDelete: "set null" }),
    activityType: varchar("activity_type", { length: 50 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id"),
    description: text("description").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_user_id").on(table.userId),
    activityTypeIdx: index("idx_activity_type").on(table.activityType),
    entityIdx: index("idx_entity_type_entity_id").on(table.entityType, table.entityId),
    createdAtIdx: index("idx_created_at").on(table.createdAt),
    sessionIdIdx: index("idx_session_id").on(table.sessionId),
  })
);

// === RELAÇÕES ATUALIZADAS ===
export const usersRelations = relations(users, ({ many }) => ({
  enderecos: many(enderecos),
  sessoes: many(sessoesUsuarios),
  lojasProprietario: many(lojas, { relationName: 'owner' }),
  lojasAprovadas: many(lojas, { relationName: 'approver' }),
  carrinhoItens: many(carrinhoItens),
  pedidos: many(pedidos),
  notificacoes: many(notificacoes),
  favoritos: many(produtoFavoritos),
  avaliacoesLoja: many(lojaAvaliacoes),
}));

export const lojasRelations = relations(lojas, ({ one, many }) => ({
  dono: one(users, { fields: [lojas.donoId], references: [users.id], relationName: 'owner' }),
  aprovador: one(users, { fields: [lojas.aprovadoPor], references: [users.id], relationName: 'approver' }),
  produtos: many(produtos),
  pedidos: many(pedidos),
  avaliacoes: many(lojaAvaliacoes),
  cupons: many(cupons),
}));

export const produtosRelations = relations(produtos, ({ one, many }) => ({
  loja: one(lojas, { fields: [produtos.lojaId], references: [lojas.id] }),
  categoria: one(categorias, { fields: [produtos.categoriaId], references: [categorias.id] }),
  variacoes: many(produtoVariacoes),
  imagens: many(produtoImagens),
  carrinhoItens: many(carrinhoItens),
  favoritos: many(produtoFavoritos),
  historicoPrecos: many(produtoHistoricoPrecos),
  itensPedido: many(pedidoItens),
  mensagens: many(mensagens),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  comprador: one(users, { fields: [pedidos.compradorId], references: [users.id] }),
  loja: one(lojas, { fields: [pedidos.lojaId], references: [lojas.id] }),
  metodoPagamento: one(metodosPagamento, { fields: [pedidos.metodoPagamentoId], references: [metodosPagamento.id] }),
  itens: many(pedidoItens),
  mensagens: many(mensagens),
}));


export const enderecosRelations = relations(enderecos, ({ one }) => ({
  user: one(users, {
    fields: [enderecos.userId],
    references: [users.id],
  }),
}));

export const sessoesUsuariosRelations = relations(sessoesUsuarios, ({ one }) => ({
  user: one(users, {
    fields: [sessoesUsuarios.userId],
    references: [users.id],
  }),
}));


export const categoriasRelations = relations(categorias, ({ one, many }) => ({
  categoriaPai: one(categorias, {
    fields: [categorias.categoriaPaiId],
    references: [categorias.id],
  }),
  subcategorias: many(categorias),
}));

export const produtoVariacoesRelations = relations(produtoVariacoes, ({ one, many }) => ({
  produto: one(produtos, {
    fields: [produtoVariacoes.produtoId],
    references: [produtos.id],
  }),
  carrinhoItens: many(carrinhoItens),
}));

export const produtoImagensRelations = relations(produtoImagens, ({ one }) => ({
  produto: one(produtos, {
    fields: [produtoImagens.produtoId],
    references: [produtos.id],
  }),
}));

export const metodosPagamentoRelations = relations(metodosPagamento, ({ many }) => ({
  pedidos: many(pedidos),
}));

export const carrinhoItensRelations = relations(carrinhoItens, ({ one }) => ({
  user: one(users, {
    fields: [carrinhoItens.userId],
    references: [users.id],
  }),
  produto: one(produtos, {
    fields: [carrinhoItens.produtoId],
    references: [produtos.id],
  }),
  variacao: one(produtoVariacoes, {
    fields: [carrinhoItens.variacaoId],
    references: [produtoVariacoes.id],
  }),
}));


export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  user: one(users, {
    fields: [notificacoes.userId],
    references: [users.id],
  }),
}));
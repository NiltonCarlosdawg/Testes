import { faker } from '@faker-js/faker';
import chalk from 'chalk';
import { Pool } from 'pg';
import { hash } from 'bcrypt';
import pino from 'pino';

import dotenv from 'dotenv'
dotenv.config()

// Configurar logger
const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Configurar pool do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configurar faker para dados aleatórios
faker.seed(Date.now()); // Usa timestamp atual para aleatoriedade

async function seed() {
  logger.info(chalk.yellow(' A iniciar o processo de seed...'));

  const allPermissions =   [
      // === USUÁRIOS ===
      { key: "users:create", name: "Criar Usuários", category: "Usuários" },
      { key: "users:read", name: "Ver Usuários", category: "Usuários" },
      { key: "users:update", name: "Editar Usuários", category: "Usuários" },
      { key: "users:delete", name: "Deletar Usuários", category: "Usuários" },
      { key: "users:manage_roles", name: "Gerenciar Roles de Usuário", category: "Usuários" },

      // === ROLES ===
      { key: "roles:create", name: "Criar Roles", category: "Roles" },
      { key: "roles:read", name: "Ver Roles", category: "Roles" },
      { key: "roles:update", name: "Editar Roles", category: "Roles" },
      { key: "roles:delete", name: "Deletar Roles", category: "Roles" },

      // === ENDEREÇOS ===
      { key: "enderecos:create", name: "Criar Endereços", category: "Endereços" },
      { key: "enderecos:read", name: "Ver Endereços", category: "Endereços" },
      { key: "enderecos:update", name: "Editar Endereços", category: "Endereços" },
      { key: "enderecos:delete", name: "Deletar Endereços", category: "Endereços" },

      // === SESSÕES ===
      { key: "sessoes_usuarios:read", name: "Ver Sessões", category: "Sessões" },
      { key: "sessoes_usuarios:revoke", name: "Revogar Sessão", category: "Sessões" },
      { key: "sessoes_usuarios:revoke_all", name: "Revogar Todas as Sessões", category: "Sessões" },

      // === LOJAS ===
      { key: "lojas:create", name: "Criar Loja", category: "Lojas" },
      { key: "lojas:read", name: "Ver Lojas", category: "Lojas" },
      { key: "lojas:update", name: "Editar Loja", category: "Lojas" },
      { key: "lojas:delete", name: "Deletar Loja", category: "Lojas" },
      { key: "lojas:approve", name: "Aprovar Loja", category: "Lojas" },
      { key: "lojas:suspend", name: "Suspender Loja", category: "Lojas" },

      // === CATEGORIAS ===
      { key: "categorias:create", name: "Criar Categoria", category: "Categorias" },
      { key: "categorias:read", name: "Ver Categorias", category: "Categorias" },
      { key: "categorias:update", name: "Editar Categoria", category: "Categorias" },
      { key: "categorias:delete", name: "Deletar Categoria", category: "Categorias" },

      // === PRODUTOS ===
      { key: "produtos:create", name: "Criar Produto", category: "Produtos" },
      { key: "produtos:read", name: "Ver Produtos", category: "Produtos" },
      { key: "produtos:update", name: "Editar Produto", category: "Produtos" },
      { key: "produtos:delete", name: "Deletar Produto", category: "Produtos" },
      { key: "produtos:manage_stock", name: "Gerenciar Estoque", category: "Produtos" },
      { key: "produtos:publish", name: "Publicar Produto", category: "Produtos" },

      // === VARIAÇÕES DE PRODUTO ===
      { key: "produto_variacoes:create", name: "Criar Variação", category: "Produtos" },
      { key: "produto_variacoes:read", name: "Ver Variações", category: "Produtos" },
      { key: "produto_variacoes:update", name: "Editar Variação", category: "Produtos" },
      { key: "produto_variacoes:delete", name: "Deletar Variação", category: "Produtos" },

      // === IMAGENS DE PRODUTO ===
      { key: "produto_imagens:create", name: "Adicionar Imagem", category: "Produtos" },
      { key: "produto_imagens:read", name: "Ver Imagens", category: "Produtos" },
      { key: "produto_imagens:update", name: "Editar Imagem", category: "Produtos" },
      { key: "produto_imagens:delete", name: "Remover Imagem", category: "Produtos" },

      // === FAVORITOS ===
      { key: "produto_favoritos:read", name: "Ver Favoritos", category: "Produtos" },
      { key: "produto_favoritos:add", name: "Adicionar aos Favoritos", category: "Produtos" },
      { key: "produto_favoritos:remove", name: "Remover dos Favoritos", category: "Produtos" },

      // === AVALIAÇÕES DE LOJA ===
      { key: "loja_avaliacoes:create", name: "Avaliar Loja", category: "Lojas" },
      { key: "loja_avaliacoes:read", name: "Ver Avaliações", category: "Lojas" },
      { key: "loja_avaliacoes:respond", name: "Responder Avaliação", category: "Lojas" },
      { key: "loja_avaliacoes:delete", name: "Deletar Avaliação", category: "Lojas" },

      // === PEDIDOS ===
      { key: "pedidos:create", name: "Criar Pedido", category: "Pedidos" },
      { key: "pedidos:read", name: "Ver Pedidos", category: "Pedidos" },
      { key: "pedidos:update", name: "Atualizar Pedido", category: "Pedidos" },
      { key: "pedidos:cancel", name: "Cancelar Pedido", category: "Pedidos" },
      { key: "pedidos:confirm", name: "Confirmar Pedido", category: "Pedidos" },
      { key: "pedidos:ship", name: "Marcar como Enviado", category: "Pedidos" },
      { key: "pedidos:deliver", name: "Marcar como Entregue", category: "Pedidos" },

      // === ITENS DO PEDIDO ===
      { key: "pedido_itens:read", name: "Ver Itens do Pedido", category: "Pedidos" },

      // === HISTÓRICO DE PREÇOS ===
      { key: "produto_historico_precos:read", name: "Ver Histórico de Preços", category: "Produtos" },

      // === FILTROS ===
      { key: "filtro_opcoes:create", name: "Criar Opção de Filtro", category: "Filtros" },
      { key: "filtro_opcoes:read", name: "Ver Opções de Filtro", category: "Filtros" },
      { key: "filtro_opcoes:update", name: "Editar Opção de Filtro", category: "Filtros" },
      { key: "filtro_opcoes:delete", name: "Deletar Opção de Filtro", category: "Filtros" },

      // === MENSAGENS ===
      { key: "mensagens:send", name: "Enviar Mensagem", category: "Mensagens" },
      { key: "mensagens:read", name: "Ler Mensagens", category: "Mensagens" },
      { key: "mensagens:mark_read", name: "Marcar como Lida", category: "Mensagens" },

      // === CUPONS ===
      { key: "cupons:create", name: "Criar Cupom", category: "Cupons" },
      { key: "cupons:read", name: "Ver Cupons", category: "Cupons" },
      { key: "cupons:update", name: "Editar Cupom", category: "Cupons" },
      { key: "cupons:delete", name: "Deletar Cupom", category: "Cupons" },
      { key: "cupons:apply", name: "Aplicar Cupom", category: "Cupons" },

      // === MÉTODOS DE PAGAMENTO ===
      { key: "metodos_pagamento:create", name: "Criar Método de Pagamento", category: "Pagamentos" },
      { key: "metodos_pagamento:read", name: "Ver Métodos de Pagamento", category: "Pagamentos" },
      { key: "metodos_pagamento:update", name: "Editar Método de Pagamento", category: "Pagamentos" },
      { key: "metodos_pagamento:delete", name: "Deletar Método de Pagamento", category: "Pagamentos" },

      // === CARRINHO ===
      { key: "carrinho_itens:add", name: "Adicionar ao Carrinho", category: "Carrinho" },
      { key: "carrinho_itens:read", name: "Ver Carrinho", category: "Carrinho" },
      { key: "carrinho_itens:update", name: "Atualizar Quantidade", category: "Carrinho" },
      { key: "carrinho_itens:remove", name: "Remover do Carrinho", category: "Carrinho" },

      // === NOTIFICAÇÕES ===
      { key: "notificacoes:read", name: "Ver Notificações", category: "Notificações" },
      { key: "notificacoes:mark_read", name: "Marcar Notificação como Lida", category: "Notificações" },
      { key: "notificacoes:delete", name: "Deletar Notificação", category: "Notificações" },

      // === LOGS ===
      { key: "activity_logs:read", name: "Ver Logs de Atividade", category: "Sistema" },

      // === SELEÇÕES DE PRODUTOS ===
      { key: "produto_selections:create", name: "Criar Seleção de Produtos", category: "Produtos" },
      { key: "produto_selections:read", name: "Ver Seleção de Produtos", category: "Produtos" },
      { key: "produto_selections:delete", name: "Deletar Seleção", category: "Produtos" },
    ];

  const adminPermissions = allPermissions.map((p) => ({
    key: p.key,
    allowed: true,
  }));
  const userPermissions = allPermissions.map((p) => ({
    key: p.key,
    allowed: false,
  }));

  let client;
  try {
    client = await pool.connect();
    logger.debug('Conexão com o banco de dados estabelecida');

    // Iniciar transação
    await client.query('BEGIN');
    logger.debug('Transação iniciada');
    logger.debug('Limpando tabelas...');
  const tables = [
      'notificacoes',
      'pedidos',
      'carrinho_itens',
      'metodos_pagamento',
      'produto_imagens',
      'produto_variacoes',
      'produtos',
      'categorias',
      'lojas',
      'sessoes_usuarios',
      'enderecos',
      'users',
      'roles',
    ];
    for (const table of tables) {
      logger.debug(`Truncando tabela ${table}...`);
      await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      logger.debug(`Tabela ${table} truncada`);
    }
    logger.info(chalk.green('Banco de dados limpo com sucesso.'));


    // Inserir roles
    logger.debug('Inserindo roles...');
    const rolesResult = await client.query(
      `
      INSERT INTO roles (nome, descricao, permissions)
      VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9)
      RETURNING id, nome
    `,
      [
        'admin', 'Acesso total ao sistema', JSON.stringify(adminPermissions),
        'vendedor', 'Gerencia lojas e produtos', JSON.stringify(adminPermissions),
        'user', 'Usuário padrão, pode comprar produtos', JSON.stringify(userPermissions),
      ]
    );
    logger.debug('Roles inseridos:');
    if (rolesResult.rows.length !== 3) {
      logger.error('Falha ao criar roles. Resultado:');
      throw new Error('Failed to create roles');
    }
    const adminRole = rolesResult.rows.find(r => r.nome === 'admin');
    const vendedorRole = rolesResult.rows.find(r => r.nome === 'vendedor');
    const userRole = rolesResult.rows.find(r => r.nome === 'user');
    logger.debug('Admin role:', adminRole);
    logger.debug('Vendedor role:', vendedorRole);
    logger.debug('User role:', userRole);
    logger.info(chalk.green('Roles criadas com sucesso.'));

    // Gerar hash da senha
    logger.debug('Gerando hash da senha...');
    const password = "123456"
    const passwordHash = await hash(password, 10);
    logger.debug('Senha gerada:');

    // Inserir admin
    logger.debug('Inserindo admin...');
    const adminEmail = "eddiendulo@gmail.com";
    const adminResult = await client.query(`
      INSERT INTO users (primeiro_nome, ultimo_nome, email, password_hash, role_id, role, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, primeiro_nome, email
    `, [
      faker.person.firstName(),
      faker.person.lastName(),
      adminEmail,
      passwordHash,
      adminRole.id,
      'admin',
      true
    ]);
    logger.debug('Admin inserido:');
    if (!adminResult.rows[0]) {
      logger.error('Falha ao criar admin. Resultado:');
      throw new Error('Failed to create admin user');
    }
    const admin = adminResult.rows[0];
    logger.debug('Admin criado:', admin);

    // Inserir vendedor1
    logger.debug('Inserindo vendedor1...');
    const vendedor1Email = faker.internet.email({ provider: 'bazar.ao' });
    const vendedor1Result = await client.query(`
      INSERT INTO users (primeiro_nome, ultimo_nome, email, password_hash, role_id, role, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, primeiro_nome, email
    `, [
      faker.person.firstName(),
      faker.person.lastName(),
      vendedor1Email,
      passwordHash,
      vendedorRole.id,
      'vendedor',
      true
    ]);
    logger.debug('Vendedor1 inserido:');
    if (!vendedor1Result.rows[0]) {
      logger.error('Falha ao criar vendedor1. Resultado:');
      throw new Error('Failed to create vendedor1');
    }
    const vendedor1 = vendedor1Result.rows[0];
    logger.debug('Vendedor1 criado:', vendedor1);

    // Inserir vendedor2
    logger.debug('Inserindo vendedor2...');
    const vendedor2Email = faker.internet.email({ provider: 'bazar.ao' });
    const vendedor2Result = await client.query(`
      INSERT INTO users (primeiro_nome, ultimo_nome, email, password_hash, role_id, role, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, primeiro_nome, email
    `, [
      faker.person.firstName(),
      faker.person.lastName(),
      vendedor2Email,
      passwordHash,
      vendedorRole.id,
      'vendedor',
      true
    ]);
    logger.debug('Vendedor2 inserido:');
    if (!vendedor2Result.rows[0]) {
      logger.error('Falha ao criar vendedor2. Resultado:');
      throw new Error('Failed to create vendedor2');
    }
    const vendedor2 = vendedor2Result.rows[0];
    logger.debug('Vendedor2 criado:', vendedor2);

    // Inserir comprador1
    logger.debug('Inserindo comprador1...');
    const comprador1Email = faker.internet.email({ provider: 'bazar.ao' });
    const comprador1Result = await client.query(`
      INSERT INTO users (primeiro_nome, ultimo_nome, email, password_hash, role_id, role, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, primeiro_nome, email
    `, [
      faker.person.firstName(),
      faker.person.lastName(),
      comprador1Email,
      passwordHash,
      userRole.id,
      'user',
      true
    ]);
    logger.debug('Comprador1 inserido:');
    if (!comprador1Result.rows[0]) {
      logger.error('Falha ao criar comprador1. Resultado:');
      throw new Error('Failed to create comprador1');
    }
    const comprador1 = comprador1Result.rows[0];
    logger.debug('Comprador1 criado:', comprador1);

    // Inserir comprador2
    logger.debug('Inserindo comprador2...');
    const comprador2Email = faker.internet.email({ provider: 'bazar.ao' });
    const comprador2Result = await client.query(`
      INSERT INTO users (primeiro_nome, ultimo_nome, email, password_hash, role_id, role, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, primeiro_nome, email
    `, [
      faker.person.firstName(),
      faker.person.lastName(),
      comprador2Email,
      passwordHash,
      userRole.id,
      'user',
      true
    ]);
    logger.debug('Comprador2 inserido:');
    if (!comprador2Result.rows[0]) {
      logger.error('Falha ao criar comprador2. Resultado:');
      throw new Error('Failed to create comprador2');
    }
    const comprador2 = comprador2Result.rows[0];
    logger.debug('Comprador2 criado:', comprador2);
    logger.info(chalk.green('Usuários criados com sucesso.'));

    // Inserir endereços
    logger.debug('Inserindo endereço para comprador1...');
    const enderecoComprador1 = {
      user_id: comprador1.id,
      nome_destinatario: `${comprador1.primeiro_nome} ${faker.person.lastName()}`,
      telefone_contato: faker.phone.number(),
      endereco_linha1: faker.location.streetAddress(),
      cidade: faker.location.city(),
      provincia: faker.location.state(),
      bairro: faker.location.street(),
      is_padrao: true,
      tipo: 'RESIDENCIAL'
    };
    logger.debug('Dados do endereço comprador1:');
    await client.query(`
      INSERT INTO enderecos (user_id, nome_destinatario, telefone_contato, endereco_linha1, cidade, provincia, bairro, is_padrao, tipo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      enderecoComprador1.user_id,
      enderecoComprador1.nome_destinatario,
      enderecoComprador1.telefone_contato,
      enderecoComprador1.endereco_linha1,
      enderecoComprador1.cidade,
      enderecoComprador1.provincia,
      enderecoComprador1.bairro,
      enderecoComprador1.is_padrao,
      enderecoComprador1.tipo
    ]);
    logger.debug('Endereço comprador1 inserido');

    logger.debug('Inserindo endereço para comprador2...');
    const enderecoComprador2 = {
      user_id: comprador2.id,
      nome_destinatario: `${comprador2.primeiro_nome} ${faker.person.lastName()}`,
      telefone_contato: faker.phone.number(),
      endereco_linha1: faker.location.streetAddress(),
      cidade: faker.location.city(),
      provincia: faker.location.state(),
      bairro: faker.location.street(),
      is_padrao: true,
      tipo: 'COMERCIAL'
    };
    logger.debug('Dados do endereço comprador2:');
    await client.query(`
      INSERT INTO enderecos (user_id, nome_destinatario, telefone_contato, endereco_linha1, cidade, provincia, bairro, is_padrao, tipo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      enderecoComprador2.user_id,
      enderecoComprador2.nome_destinatario,
      enderecoComprador2.telefone_contato,
      enderecoComprador2.endereco_linha1,
      enderecoComprador2.cidade,
      enderecoComprador2.provincia,
      enderecoComprador2.bairro,
      enderecoComprador2.is_padrao,
      enderecoComprador2.tipo
    ]);
    logger.debug('Endereço comprador2 inserido');
    logger.info(chalk.green('Endereços criados com sucesso.'));

    // Inserir métodos de pagamento
    logger.debug('Inserindo métodos de pagamento...');
    const pagamentoResult = await client.query(`
      INSERT INTO metodos_pagamento (nome, codigo, ativo)
      VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9)
      RETURNING id, nome
    `, [
      'Referência Bancária', `REF_${faker.string.alphanumeric(8).toUpperCase()}`, true,
      'Cartão de Crédito', `CARD_${faker.string.alphanumeric(8).toUpperCase()}`, false,
      'Pagamento na Entrega', `ENTREGA_${faker.string.alphanumeric(8).toUpperCase()}`, true
    ]);
    logger.debug('Métodos de pagamento inseridos:');
    if (!pagamentoResult.rows[0]) {
      logger.error('Falha ao criar métodos de pagamento. Resultado:');
      throw new Error('Failed to create payment methods');
    }
    const pagamentoRef = pagamentoResult.rows[0];
    logger.debug('Método de pagamento criado:', pagamentoRef);
    logger.info(chalk.green('Métodos de pagamento criados com sucesso.'));
// Inserir loja1
logger.debug('Inserindo loja1...');
const loja1Result = await client.query(`
  INSERT INTO lojas (dono_id, nome, descricao, status, aprovado_por, aprovado_em, email_comercial, telefone_comercial)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING id, nome
`, [
  vendedor1.id,
  `${faker.company.name()} Tecnologia`,
  faker.commerce.productDescription(),
  'ATIVA', // Keep as ATIVA
  admin.id,
  new Date(),
  faker.internet.email({ provider: 'tecnologia-cia.ao' }),
  faker.phone.number(),
]);
logger.debug('Loja1 inserida:');
if (!loja1Result.rows[0]) {
  logger.error('Falha ao criar loja1. Resultado:');
  throw new Error('Failed to create loja1');
}
const loja1 = loja1Result.rows[0];
logger.debug('Loja1 criada:', loja1);

// Inserir loja2
logger.debug('Inserindo loja2...');
const loja2Result = await client.query(`
  INSERT INTO lojas (dono_id, nome, descricao, status, aprovado_por, aprovado_em, email_comercial, telefone_comercial)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING id, nome
`, [
  vendedor2.id,
  `${faker.company.name()} Moda`,
  faker.commerce.productDescription(),
  'PENDENTE', 
  admin.id,
  new Date(),
  faker.internet.email({ provider: 'modaurbana.ao' }),
  faker.phone.number(),
]);
logger.debug('Loja2 inserida:');
if (!loja2Result.rows[0]) {
  logger.error('Falha ao criar loja2. Resultado:');
  throw new Error('Failed to create loja2');
}
const loja2 = loja2Result.rows[0];
logger.debug('Loja2 criada:', loja2);
logger.info(chalk.green('Lojas criadas com sucesso.'));

    // Inserir categorias
    logger.debug('Inserindo categoria Eletrônicos...');
    const catEletronicosResult = await client.query(`
      INSERT INTO categorias (nome, slug, descricao)
      VALUES ($1, $2, $3)
      RETURNING id, nome
    `, [
      'Eletrônicos',
      faker.helpers.slugify('Eletrônicos'),
      'Dispositivos eletrônicos em geral'
    ]);
    logger.debug('Categoria Eletrônicos inserida:');
    if (!catEletronicosResult.rows[0]) {
      logger.error('Falha ao criar categoria Eletrônicos. Resultado:');
      throw new Error('Failed to create categoria Eletrônicos');
    }
    const catEletronicos = catEletronicosResult.rows[0];
    logger.debug('Categoria Eletrônicos criada:', catEletronicos);

    logger.debug('Inserindo categoria Moda...');
    const catModaResult = await client.query(`
      INSERT INTO categorias (nome, slug, descricao)
      VALUES ($1, $2, $3)
      RETURNING id, nome
    `, [
      'Moda',
      faker.helpers.slugify('Moda'),
      'Artigos de vestuário e acessórios'
    ]);
    logger.debug('Categoria Moda inserida:');
    if (!catModaResult.rows[0]) {
      logger.error('Falha ao criar categoria Moda. Resultado:');
      throw new Error('Failed to create categoria Moda');
    }
    const catModa = catModaResult.rows[0];
    logger.debug('Categoria Moda criada:', catModa);

    logger.debug('Inserindo categoria Smartphones...');
    const catSmartphonesResult = await client.query(`
      INSERT INTO categorias (nome, slug, categoria_pai_id)
      VALUES ($1, $2, $3)
      RETURNING id, nome
    `, [
      'Smartphones',
      faker.helpers.slugify('Smartphones'),
      catEletronicos.id
    ]);
    logger.debug('Categoria Smartphones inserida:');
    if (!catSmartphonesResult.rows[0]) {
      logger.error('Falha ao criar categoria Smartphones. Resultado:');
      throw new Error('Failed to create categoria Smartphones');
    }
    const catSmartphones = catSmartphonesResult.rows[0];
    logger.debug('Categoria Smartphones criada:', catSmartphones);

    logger.debug('Inserindo categoria Camisetas...');
    const catCamisetasResult = await client.query(`
      INSERT INTO categorias (nome, slug, categoria_pai_id)
      VALUES ($1, $2, $3)
      RETURNING id, nome
    `, [
      'Camisetas',
      faker.helpers.slugify('Camisetas'),
      catModa.id
    ]);
    logger.debug('Categoria Camisetas inserida:');
    if (!catCamisetasResult.rows[0]) {
      logger.error('Falha ao criar categoria Camisetas. Resultado:');
      throw new Error('Failed to create categoria Camisetas');
    }
    const catCamisetas = catCamisetasResult.rows[0];
    logger.debug('Categoria Camisetas criada:', catCamisetas);
    logger.info(chalk.green('Categorias criadas com sucesso.'));

    // Inserir produto1
    logger.debug('Inserindo produto1...');
    const produto1Preco = faker.commerce.price({ min: 500000, max: 1000000, dec: 2 });
    const produto1Result = await client.query(`
      INSERT INTO produtos (loja_id, titulo, descricao, categoria_id, preco, quantidade_estoque, condicao, marca)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, titulo, preco
    `, [
      loja1.id,
      faker.commerce.productName(),
      faker.commerce.productDescription(),
      catSmartphones.id,
      produto1Preco,
      faker.number.int({ min: 10, max: 100 }),
      'NOVO',
      faker.company.name()
    ]);
    logger.debug('Produto1 inserido:');
    if (!produto1Result.rows[0]) {
      logger.error('Falha ao criar produto1. Resultado:');
      throw new Error('Failed to create produto1');
    }
    const produto1 = produto1Result.rows[0];
    logger.debug('Produto1 criado:', produto1);

    logger.debug('Inserindo imagem para produto1...');
    await client.query(`
      INSERT INTO produto_imagens (produto_id, url, is_principal)
      VALUES ($1, $2, $3)
    `, [
      produto1.id,
      faker.image.urlLoremFlickr({ category: 'technics' }),
      true
    ]);
    logger.debug('Imagem produto1 inserida');

    // // Inserir produto2
    // logger.debug('Inserindo produto2...');
    // const produto2Preco = faker.commerce.price({ min: 700000, max: 1200000, dec: 2 });
    // const produto2Result = await client.query(`
    //   INSERT INTO produtos (loja_id, titulo, descricao, categoria_id, preco, quantidade_estoque, condicao, marca)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    //   RETURNING id, titulo, preco
    // `, [
    //   loja1.id,
    //   faker.commerce.productName(),
    //   faker.commerce.productDescription(),
    //   catEletronicos.id,
    //   produto2Preco,
    //   faker.number.int({ min: 10, max: 50 }),
    //   'NOVO',
    //   faker.company.name()
    // ]);
    // logger.debug('Produto2 inserido:', produto2Result.rows);
    // if (!produto2Result.rows[0]) {
    //   logger.error('Falha ao criar produto2. Resultado:', produto2Result.rows);
    //   throw new Error('Failed to create produto2');
    // }
    // const produto2 = produto2Result.rows[0];
    // logger.debug('Produto2 criado:', produto2);

    // logger.debug('Inserindo imagem para produto2...');
    // await client.query(`
    //   INSERT INTO produto_imagens (produto_id, url, is_principal)
    //   VALUES ($1, $2, $3)
    // `, [
    //   produto2.id,
    //   faker.image.urlLoremFlickr({ category: 'technics' }),
    //   true
    // ]);
    // logger.debug('Imagem produto2 inserida');

    // Inserir produto3
    // logger.debug('Inserindo produto3...');
    // const produto3Preco = faker.commerce.price({ min: 10000, max: 50000, dec: 2 });
    // const produto3Result = await client.query(`
    //   INSERT INTO produtos (loja_id, titulo, descricao, categoria_id, preco, quantidade_estoque, condicao, marca)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    //   RETURNING id, titulo, preco
    // `, [
    //   loja2.id,
    //   faker.commerce.productName(),
    //   faker.commerce.productDescription(),
    //   catCamisetas.id,
    //   produto3Preco,
    //   0,
    //   'NOVO',
    //   faker.company.name()
    // ]);
    // logger.debug('Produto3 inserido:', produto3Result.rows);
    // if (!produto3Result.rows[0]) {
    //   logger.error('Falha ao criar produto3. Resultado:', produto3Result.rows);
    //   throw new Error('Failed to create produto3');
    // }
    // const produto3 = produto3Result.rows[0];
    // logger.debug('Produto3 criado:', produto3);

    // logger.debug('Inserindo imagem para produto3...');
    // await client.query(`
    //   INSERT INTO produto_imagens (produto_id, url, is_principal)
    //   VALUES ($1, $2, $3)
    // `, [
    //   produto3.id,
    //   faker.image.urlLoremFlickr({ category: 'fashion' }),
    //   true
    // ]);
    // logger.debug('Imagem produto3 inserida');

    // // Inserir variações de produto
    // logger.debug('Inserindo variações para produto3...');
    // await client.query(`
    //   INSERT INTO produto_variacoes (produto_id, nome, quantidade_estoque, atributos)
    //   VALUES
    //     ($1, $2, $3, $4),
    //     ($5, $6, $7, $8),
    //     ($9, $10, $11, $12)
    // `, [
    //   produto3.id,
    //   `${faker.commerce.productAdjective()} Tamanho P / Cor ${faker.color.human()}`,
    //   faker.number.int({ min: 10, max: 50 }),
    //   JSON.stringify({ tamanho: 'P', cor: faker.color.human() }),
    //   produto3.id,
    //   `${faker.commerce.productAdjective()} Tamanho M / Cor ${faker.color.human()}`,
    //   faker.number.int({ min: 10, max: 50 }),
    //   JSON.stringify({ tamanho: 'M', cor: faker.color.human() }),
    //   produto3.id,
    //   `${faker.commerce.productAdjective()} Tamanho G / Cor ${faker.color.human()}`,
    //   faker.number.int({ min: 10, max: 50 }),
    //   JSON.stringify({ tamanho: 'G', cor: faker.color.human() })
    // ]);
    // logger.debug('Variações produto3 inseridas');
    // logger.info(chalk.green('Produtos e variações criados com sucesso.'));

    // Inserir pedido1
    logger.debug('Inserindo pedido1...');
    const subtotalPedido1 = parseFloat(produto1.preco);
    const valorFrete1 = parseFloat(faker.commerce.price({ min: 1000, max: 5000, dec: 2 }));
    const pedido1Data = {
      numero_pedido: `BAZAR-${faker.string.alphanumeric(10).toUpperCase()}`,
      comprador_id: comprador1.id,
      loja_id: loja1.id,
      subtotal: subtotalPedido1.toFixed(2),
      valor_frete: valorFrete1.toFixed(2),
      total: (subtotalPedido1 + valorFrete1).toFixed(2),
      metodo_pagamento_id: pagamentoRef.id,
      status: 'ENTREGUE',
      status_pagamento: 'PAGO',
      endereco_entrega: enderecoComprador1,
      entregue_em: faker.date.recent(),
      pago_em: faker.date.recent()
    };
    logger.debug('Dados do pedido1:');
    await client.query(`
      INSERT INTO pedidos (numero_pedido, comprador_id, loja_id, subtotal, valor_frete, total, metodo_pagamento_id, status, status_pagamento, endereco_entrega, entregue_em, pago_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      pedido1Data.numero_pedido,
      pedido1Data.comprador_id,
      pedido1Data.loja_id,
      pedido1Data.subtotal,
      pedido1Data.valor_frete,
      pedido1Data.total,
      pedido1Data.metodo_pagamento_id,
      pedido1Data.status,
      pedido1Data.status_pagamento,
      JSON.stringify(pedido1Data.endereco_entrega),
      pedido1Data.entregue_em,
      pedido1Data.pago_em
    ]);
    logger.debug('Pedido1 inserido');

    // Inserir pedido2
    logger.debug('Inserindo pedido2...');
    const subtotalPedido2 = parseFloat(produto1.preco);
    const valorFrete2 = parseFloat(faker.commerce.price({ min: 1000, max: 5000, dec: 2 }));
    const pedido2Data = {
      numero_pedido: `BAZAR-${faker.string.alphanumeric(10).toUpperCase()}`,
      comprador_id: comprador2.id,
      loja_id: loja2.id,
      subtotal: subtotalPedido2.toFixed(2),
      valor_frete: valorFrete2.toFixed(2),
      total: (subtotalPedido2 + valorFrete2).toFixed(2),
      metodo_pagamento_id: pagamentoRef.id,
      status: 'PENDENTE',
      status_pagamento: 'PENDENTE',
      endereco_entrega: enderecoComprador1
    };
    logger.debug('Dados do pedido2:');
    await client.query(`
      INSERT INTO pedidos (numero_pedido, comprador_id, loja_id, subtotal, valor_frete, total, metodo_pagamento_id, status, status_pagamento, endereco_entrega)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      pedido2Data.numero_pedido,
      pedido2Data.comprador_id,
      pedido2Data.loja_id,
      pedido2Data.subtotal,
      pedido2Data.valor_frete,
      pedido2Data.total,
      pedido2Data.metodo_pagamento_id,
      pedido2Data.status,
      pedido2Data.status_pagamento,
      JSON.stringify(pedido2Data.endereco_entrega)
    ]);
    logger.debug('Pedido2 inserido');
    logger.info(chalk.green('Pedidos criados com sucesso.'));

    // Inserir notificações
    logger.debug('Inserindo notificação para comprador1...');
    await client.query(`
      INSERT INTO notificacoes (user_id, tipo, titulo, mensagem)
      VALUES ($1, $2, $3, $4)
    `, [
      comprador1.id,
      'pedido_entregue',
      'Seu pedido foi entregue!',
      `O pedido para o item '${produto1.titulo}' foi marcado como entregue.`
    ]);
    logger.debug('Notificação comprador1 inserida');

    logger.debug('Inserindo notificação para vendedor1...');
    await client.query(`
      INSERT INTO notificacoes (user_id, tipo, titulo, mensagem)
      VALUES ($1, $2, $3, $4)
    `, [
      vendedor1.id,
      'nova_venda',
      'Você tem uma nova venda!',
      `O usuário ${comprador1.primeiro_nome} comprou o item '${produto1.titulo}'.`
    ]);
    logger.debug('Notificação vendedor1 inserida');
    logger.info(chalk.green('Notificações criadas com sucesso.'));

    // Confirmar transação
    await client.query('COMMIT');
    logger.debug('Transação confirmada');
    logger.info(chalk.green.bold('Seed concluído com sucesso!'));
  } catch (error) {
    logger.error({
      msg: 'Falha no processo de seed:',
      error: error instanceof Error ? error.stack ?? error.message : String(error)
    });
    if (client) {
      await client.query('ROLLBACK');
      logger.debug('Transação revertida');
    }
    process.exit(1);
  } finally {
    if (client) {
      client.release();
      logger.debug('Conexão com o banco liberada');
    }
    await pool.end();
    logger.debug('Pool de conexões encerrado');
    process.exit();
  }
}

seed();
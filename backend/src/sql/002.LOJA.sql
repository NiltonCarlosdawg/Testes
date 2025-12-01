CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
    unix_ts_ms bigint;
    uuid_bytes bytea;
BEGIN
    unix_ts_ms := (extract(epoch from clock_timestamp()) * 1000)::bigint;
    uuid_bytes := overlay(gen_random_bytes(16)
        placing substring(int8send(unix_ts_ms), 3, 6)
        from 1 for 6);
    uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
    uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
    return encode(uuid_bytes, 'hex')::uuid;
END
$$;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  primeiro_nome VARCHAR(100) NOT NULL,
  ultimo_nome VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'suspenso', 'inativo')),
  email_verificado BOOLEAN DEFAULT FALSE,
  telefone_verificado BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enderecos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_destinatario VARCHAR(150) NOT NULL,
  telefone_contato VARCHAR(20) NOT NULL,
  endereco_linha1 VARCHAR(255) NOT NULL,
  endereco_linha2 VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(20),
  ponto_referencia TEXT,
  is_padrao BOOLEAN DEFAULT FALSE,
  tipo VARCHAR(20) DEFAULT 'residencial' 
    CHECK (tipo IN ('residencial', 'comercial', 'outro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessoes_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lojas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  dono_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'ativa', 'suspensa', 'inativa')),
  documento_identificacao VARCHAR(100),
  email_comercial VARCHAR(255),
  telefone_comercial VARCHAR(20),
  endereco_comercial JSONB,
  aprovado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  aprovado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  categoria_pai_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  descricao TEXT,
  icone_url TEXT,
  ordem INTEGER DEFAULT 0,
  is_ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Produtos
-- sku: identificador interno único do produto
-- codigo_barras: usado para integração com leitores físicos
-- quantidade_estoque: controle de inventário
-- quantidade_minima: limite para alertas ou pedidos automáticos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  preco NUMERIC(15, 2) NOT NULL CHECK (preco >= 0),
  preco_original NUMERIC(15, 2) CHECK (preco_original >= preco),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  condicao VARCHAR(20) DEFAULT 'novo' 
    CHECK (condicao IN ('novo', 'usado', 'recondicionado')),
  quantidade_estoque INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
  quantidade_minima INTEGER DEFAULT 1,
  permite_pedido_sem_estoque BOOLEAN DEFAULT FALSE,
  sku VARCHAR(100),
  codigo_barras VARCHAR(100),
  peso_kg NUMERIC(8, 2),
  altura_cm NUMERIC(8, 2),
  largura_cm NUMERIC(8, 2),
  is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Produto Variações
-- permite associar múltiplas variações (cor, tamanho, etc.)
-- atributos: JSONB com pares chave-valor (ex: {"cor": "vermelho", "tamanho": "M"})
CREATE TABLE produto_variacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  sku VARCHAR(100),
  preco_adicional NUMERIC(15, 2) DEFAULT 0,
  quantidade_estoque INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
  atributos JSONB,
  is_ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE produto_imagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  texto_alternativo VARCHAR(255),
  posicao INTEGER NOT NULL DEFAULT 1,
  is_principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE metodos_pagamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  icone_url TEXT,
  taxa_percentual NUMERIC(5, 2) DEFAULT 0,
  taxa_fixa NUMERIC(10, 2) DEFAULT 0,
  is_ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE carrinho_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  variacao_id UUID REFERENCES produto_variacoes(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, produto_id, variacao_id)
);

-- Pedidos
-- subtotal: soma dos itens antes de descontos e frete
-- total: valor final pago (subtotal - desconto + frete)
-- status_pagamento: controle da transação financeira
-- status: ciclo de vida da entrega do pedido
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  numero_pedido VARCHAR(50) NOT NULL UNIQUE,
  comprador_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE RESTRICT,
  subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
  valor_frete NUMERIC(15, 2) DEFAULT 0 CHECK (valor_frete >= 0),
  desconto NUMERIC(15, 2) DEFAULT 0 CHECK (desconto >= 0),
  total NUMERIC(15, 2) NOT NULL CHECK (total >= 0),
  metodo_pagamento_id UUID REFERENCES metodos_pagamento(id),
  status_pagamento VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status_pagamento IN ('pendente', 'pago', 'falhado', 'reembolsado')),
  referencia_pagamento VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'confirmado', 'preparando', 'enviado', 'entregue', 'cancelado', 'devolvido')),
  endereco_entrega JSONB NOT NULL,
  codigo_rastreio VARCHAR(100),
  transportadora VARCHAR(100),
  previsao_entrega DATE,
  observacoes_comprador TEXT,
  observacoes_vendedor TEXT,
  motivo_cancelamento TEXT,
  confirmado_em TIMESTAMPTZ,
  pago_em TIMESTAMPTZ,
  enviado_em TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  cancelado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  referencia_id UUID,
  referencia_tipo VARCHAR(50), 
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

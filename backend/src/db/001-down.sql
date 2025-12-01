-- Drop all foreign key constraints first
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_user_id_users_id_fk";
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_session_id_sessoes_usuarios_id_fk";

ALTER TABLE "carrinho_itens" DROP CONSTRAINT IF EXISTS "carrinho_itens_user_id_users_id_fk";
ALTER TABLE "carrinho_itens" DROP CONSTRAINT IF EXISTS "carrinho_itens_produto_id_produtos_id_fk";
ALTER TABLE "carrinho_itens" DROP CONSTRAINT IF EXISTS "carrinho_itens_variacao_id_produto_variacoes_id_fk";

ALTER TABLE "cupons" DROP CONSTRAINT IF EXISTS "cupons_loja_id_lojas_id_fk";

ALTER TABLE "enderecos" DROP CONSTRAINT IF EXISTS "enderecos_user_id_users_id_fk";

ALTER TABLE "filtro_opcoes" DROP CONSTRAINT IF EXISTS "filtro_opcoes_categoria_id_categorias_id_fk";

ALTER TABLE "loja_avaliacoes" DROP CONSTRAINT IF EXISTS "loja_avaliacoes_loja_id_lojas_id_fk";
ALTER TABLE "loja_avaliacoes" DROP CONSTRAINT IF EXISTS "loja_avaliacoes_avaliador_id_users_id_fk";
ALTER TABLE "loja_avaliacoes" DROP CONSTRAINT IF EXISTS "loja_avaliacoes_pedido_id_pedidos_id_fk";

ALTER TABLE "lojas" DROP CONSTRAINT IF EXISTS "lojas_dono_id_users_id_fk";
ALTER TABLE "lojas" DROP CONSTRAINT IF EXISTS "lojas_aprovado_por_users_id_fk";

ALTER TABLE "mensagens" DROP CONSTRAINT IF EXISTS "mensagens_remetente_id_users_id_fk";
ALTER TABLE "mensagens" DROP CONSTRAINT IF EXISTS "mensagens_destinatario_id_users_id_fk";
ALTER TABLE "mensagens" DROP CONSTRAINT IF EXISTS "mensagens_produto_id_produtos_id_fk";
ALTER TABLE "mensagens" DROP CONSTRAINT IF EXISTS "mensagens_pedido_id_pedidos_id_fk";

ALTER TABLE "notificacoes" DROP CONSTRAINT IF EXISTS "notificacoes_user_id_users_id_fk";

ALTER TABLE "pedido_itens" DROP CONSTRAINT IF EXISTS "pedido_itens_pedido_id_pedidos_id_fk";
ALTER TABLE "pedido_itens" DROP CONSTRAINT IF EXISTS "pedido_itens_produto_id_produtos_id_fk";
ALTER TABLE "pedido_itens" DROP CONSTRAINT IF EXISTS "pedido_itens_variacao_id_produto_variacoes_id_fk";

ALTER TABLE "pedidos" DROP CONSTRAINT IF EXISTS "pedidos_comprador_id_users_id_fk";
ALTER TABLE "pedidos" DROP CONSTRAINT IF EXISTS "pedidos_loja_id_lojas_id_fk";
ALTER TABLE "pedidos" DROP CONSTRAINT IF EXISTS "pedidos_metodo_pagamento_id_metodos_pagamento_id_fk";

ALTER TABLE "produto_favoritos" DROP CONSTRAINT IF EXISTS "produto_favoritos_user_id_users_id_fk";
ALTER TABLE "produto_favoritos" DROP CONSTRAINT IF EXISTS "produto_favoritos_produto_id_produtos_id_fk";

ALTER TABLE "produto_historico_precos" DROP CONSTRAINT IF EXISTS "produto_historico_precos_produto_id_produtos_id_fk";

ALTER TABLE "produto_imagens" DROP CONSTRAINT IF EXISTS "produto_imagens_produto_id_produtos_id_fk";

ALTER TABLE "produto_variacoes" DROP CONSTRAINT IF EXISTS "produto_variacoes_produto_id_produtos_id_fk";

ALTER TABLE "produtos" DROP CONSTRAINT IF EXISTS "produtos_loja_id_lojas_id_fk";
ALTER TABLE "produtos" DROP CONSTRAINT IF EXISTS "produtos_categoria_id_categorias_id_fk";

ALTER TABLE "sessoes_usuarios" DROP CONSTRAINT IF EXISTS "sessoes_usuarios_user_id_users_id_fk";

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_id_roles_id_fk";

-- Drop all indexes
DROP INDEX IF EXISTS "idx_user_id";
DROP INDEX IF EXISTS "idx_activity_type";
DROP INDEX IF EXISTS "idx_entity_type_entity_id";
DROP INDEX IF EXISTS "idx_created_at";
DROP INDEX IF EXISTS "idx_session_id";
DROP INDEX IF EXISTS "unique_user_produto_variacao";
DROP INDEX IF EXISTS "categorias_slug_idx";
DROP INDEX IF EXISTS "enderecos_user_id_idx";
DROP INDEX IF EXISTS "unique_filtro_opcao";
DROP INDEX IF EXISTS "unique_loja_avaliacao";
DROP INDEX IF EXISTS "metodos_pagamento_codigo_idx";
DROP INDEX IF EXISTS "notificacoes_user_id_idx";
DROP INDEX IF EXISTS "pedidos_numero_pedido_idx";
DROP INDEX IF EXISTS "pedidos_status_idx";
DROP INDEX IF EXISTS "unique_user_produto_favorito";
DROP INDEX IF EXISTS "produtos_sku_idx";
DROP INDEX IF EXISTS "produtos_loja_id_idx";
DROP INDEX IF EXISTS "produtos_categoria_id_idx";
DROP INDEX IF EXISTS "produtos_ativo_idx";
DROP INDEX IF EXISTS "produtos_condicao_idx";
DROP INDEX IF EXISTS "produtos_preco_idx";
DROP INDEX IF EXISTS "produtos_created_at_idx";
DROP INDEX IF EXISTS "roles_nome_idx";
DROP INDEX IF EXISTS "sessoes_token_idx";
DROP INDEX IF EXISTS "users_email_idx";

-- Drop all tables
DROP TABLE IF EXISTS "activity_logs" CASCADE;
DROP TABLE IF EXISTS "carrinho_itens" CASCADE;
DROP TABLE IF EXISTS "categorias" CASCADE;
DROP TABLE IF EXISTS "cupons" CASCADE;
DROP TABLE IF EXISTS "enderecos" CASCADE;
DROP TABLE IF EXISTS "filtro_opcoes" CASCADE;
DROP TABLE IF EXISTS "loja_avaliacoes" CASCADE;
DROP TABLE IF EXISTS "lojas" CASCADE;
DROP TABLE IF EXISTS "mensagens" CASCADE;
DROP TABLE IF EXISTS "metodos_pagamento" CASCADE;
DROP TABLE IF EXISTS "notificacoes" CASCADE;
DROP TABLE IF EXISTS "pedido_itens" CASCADE;
DROP TABLE IF EXISTS "pedidos" CASCADE;
DROP TABLE IF EXISTS "produto_favoritos" CASCADE;
DROP TABLE IF EXISTS "produto_historico_precos" CASCADE;
DROP TABLE IF EXISTS "produto_imagens" CASCADE;
DROP TABLE IF EXISTS "produto_selections" CASCADE;
DROP TABLE IF EXISTS "produto_variacoes" CASCADE;
DROP TABLE IF EXISTS "produtos" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "sessoes_usuarios" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop function if exists
DROP FUNCTION IF EXISTS uuid_generate_v7();
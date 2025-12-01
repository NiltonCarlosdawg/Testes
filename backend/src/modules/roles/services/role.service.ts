import { formatZodError } from "@/utils/formatZodError.js";
import { CreateRoleInput, UpdateRoleInput, createRoleSchema } from "../schemas/role.schema.js";
import { BadRequestException, ConflictException, NotFoundException, ValidationException } from "@/utils/domain.js";
import { RoleRepository } from "../repositories/role.repository.js";
import { TRolePermission, TRoleType } from "../types/role.types.js";
import { IdMandatory } from "@/utils/IdMandatory.js";
import { NOTFOUND } from "@/utils/CONSTANTS.js";
import { TQueryRequest } from "@/types/query.types.js";
import { validatePaginationParams } from "@/utils/validatePaginationParams.js";

const COMPONENT = "rolesServices";

export class RoleService {
  private repository: RoleRepository;

  constructor(repository: RoleRepository) {
    this.repository = repository;
  }

  async create(data: CreateRoleInput): Promise<string> {
    const allPermissions = await this.getPermissionsTemplate();
    const roleData = { ...data, permissions: allPermissions };
    const validation = createRoleSchema.safeParse(roleData);
    if (!validation.success) {
      const errorMessage = formatZodError(validation.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }

    const existingRole = await this.repository.findByName(validation.data.nome);
    if (existingRole) {
      throw new ConflictException("Role já existe", COMPONENT);
    }

    return await this.repository.create(validation.data);
  }

  async findByName(nome: string): Promise<TRoleType> {
    return await this.repository.findByName(nome);
  }

  async findById(id: string): Promise<TRoleType | null> {
    await IdMandatory(id);
    const role = await this.repository.findById(id);
    if (!role) {
      throw new NotFoundException(`${NOTFOUND("role")}`, COMPONENT);
    }
    return role;
  }
  async findAll({ page, limit, search }: TQueryRequest): Promise<{ data: TRoleType[]; pagination: { page: number; limit: number; totalPages: number; total: number } }> {
    validatePaginationParams(page, limit, COMPONENT);
    const { data, total } = await this.repository.findAll({ page, limit, search: search ?? "" });
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: { page, limit, totalPages, total },
    };
  }

  async findAllWithoutPermissions({ page, limit, search }: TQueryRequest): Promise<{ data: TRoleType[]; pagination: { page: number; limit: number; totalPages: number; total: number } }> {
    validatePaginationParams(page, limit, COMPONENT);
    const { data, total } = await this.repository.findAllWithoutPermissions({ page, limit, search: search ?? "" });
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: { page, limit, totalPages, total },
    };
  }

  async update({ id, data }: { id: string; data: UpdateRoleInput }): Promise<TRoleType> {
    await this.findById(id);
    if (data.permissions) {
      await this.validatePermissionKeys(data.permissions);
    }
    return await this.repository.update({ id, data });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    const isRoleInUse = await this.checkIfRoleIsInUse(id);
    if (isRoleInUse) {
      throw new BadRequestException("Não é possível deletar uma role que está sendo utilizada por usuários", COMPONENT);
    }
    await this.repository.delete(id);
  }

  async checkIfRoleIsInUse(roleId: string): Promise<boolean> {
    const result =  await this.repository.checkIfRoleIsInUse(roleId)
    return result
  }

  async validatePermissionKeys(permissions: { key: string; name: string; allowed: boolean }[]): Promise<void> {
    const availablePermissions = await this.getAvailablePermissions();
    const validKeys = availablePermissions.map((p) => p.key);
    const invalidPermissions = permissions.filter((p) => !validKeys.includes(p.key));
    if (invalidPermissions.length > 0) {
      throw new ValidationException(
        `Chaves de permissões inválidas: ${invalidPermissions.map((p) => p.key).join(", ")}`,
        COMPONENT
      );
    }
  }

  async updateAllRolesWithNewPermissions(): Promise<{ updated: number; total: number }> {
    const allRoles = await this.repository.findAllWithoutPermissions({ page: 1, limit: 1000 });
    const template = await this.getPermissionsTemplate();

    const updates: { id: string; permissions: TRolePermission[] }[] = [];

    for (const role of allRoles.data) {
      const updatedPermissions = template.map(perm => ({
        key: perm.key,
        name: perm.name,
        category: perm.category,
        allowed: true,
      }));

      if (JSON.stringify(role.permissions) !== JSON.stringify(updatedPermissions)) {
        updates.push({ id: role.id, permissions: updatedPermissions });
      }
    }

    if (updates.length > 0) {
      await this.repository.bulkUpdatePermissions(updates);
    }

    return {
      updated: updates.length,
      total: allRoles.data.length,
    };
  }

  async getAvailablePermissions(): Promise<{ key: string; name: string; category: string }[]> {
    return [
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
  }

  async getPermissionsTemplate(): Promise<{ key: string; name: string; allowed: boolean; category: string }[]> {
    const availablePermissions = await this.getAvailablePermissions();
    return availablePermissions.map((perm) => ({
      ...perm,
      allowed: true,
    }));
  }

  async getCompleteRolePermissions(roleId: string): Promise<{ key: string; name: string; allowed: boolean; category: string }[]> {
    const role = await this.findById(roleId);
    if (!role) {
      throw new NotFoundException("Role não encontrada", COMPONENT);
    }
    const template = await this.getPermissionsTemplate();
    return template.map((templatePerm) => {
      const rolePermission = role.permissions.find((rp) => rp.key === templatePerm.key);
      return {
        ...templatePerm,
        allowed: rolePermission ? rolePermission.allowed : false,
      };
    });
  }

  getAllowedPermissions(role: TRoleType): string[] {
    return role.permissions.filter((p) => p.allowed).map((p) => p.key);
  }
}

export default RoleService;
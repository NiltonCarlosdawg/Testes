import { FastifyRequest } from 'fastify';
import {
  Result,
  Ok,
  Err,
  ErrorFactory,
  type ForbiddenError
} from '@/utils/result.js';
import { ForbiddenException } from '@/utils/domain.js';
import RoleRepository from '@/modules/roles/repositories/role.repository.js';
import RoleService from '@/modules/roles/services/role.service.js';

export const rbacMiddleware = (requiredPermissions: string[], requireAll: boolean = true) => {
  const roleRepository = new RoleRepository()
  const roleService = new RoleService(roleRepository)

  return async (request: FastifyRequest): Promise<void> => {
    const user = request.user;

    if (!user || !user.roleId) {
      throw new ForbiddenException('Acesso negado. Role não encontrada.', 'RBACMiddleware');
    }

    const role = await roleService.findById(user.roleId);

    if (!role) {
      throw new ForbiddenException('Acesso negado. Role inválida.', 'RBACMiddleware');
    }

    const allowedPermissions = roleService.getAllowedPermissions(role);

    const hasPermission = requireAll
      ? requiredPermissions.every(p => allowedPermissions.includes(p))
      : requiredPermissions.some(p => allowedPermissions.includes(p));

    if (!hasPermission) {
      const missingPermissions = requiredPermissions.filter(p => !allowedPermissions.includes(p));
      throw new ForbiddenException(
        `Acesso negado. Permissões necessárias: ${missingPermissions.join(', ')}`,
        missingPermissions.join(', ')
      );
    }
  };
};

export const rbacMiddlewareResult = (requiredPermissions: string[], requireAll: boolean = true) => {
  const roleRepository = new RoleRepository()
  const roleService = new RoleService(roleRepository)
  return async (request: FastifyRequest): Promise<Result<true, ForbiddenError>> => {
    const user = request.user;

    if (!user || !user.roleId) {
      return Err(
        ErrorFactory.forbidden('Acesso negado. Role não encontrada.', undefined, 'RBACMiddleware')
      );
    }

    const role = await roleService.findById(user.roleId);

    if (!role) {
      return Err(
        ErrorFactory.forbidden('Acesso negado. Role inválida.', undefined, 'RBACMiddleware')
      );
    }

    const allowedPermissions = roleService.getAllowedPermissions(role);

    const hasPermission = requireAll
      ? requiredPermissions.every(p => allowedPermissions.includes(p))
      : requiredPermissions.some(p => allowedPermissions.includes(p));

    if (!hasPermission) {
      const missingPermissions = requiredPermissions.filter(p => !allowedPermissions.includes(p));
      return Err(
        ErrorFactory.forbidden(
          `Acesso negado. Permissões necessárias: ${missingPermissions.join(', ')}`,
          missingPermissions.join(', '),
          'RBACMiddleware'
        )
      );
    }

    return Ok(true);
  };
};
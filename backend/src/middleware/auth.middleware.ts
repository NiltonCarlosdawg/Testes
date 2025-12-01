import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { NotFoundException, UnauthorizedException } from '@/utils/domain.js';
import {
  Result,
  Ok,
  Err,
  ErrorFactory,
  type UnauthorizedError,
  type NotFoundError
} from '@/utils/result.js';
import SessionRepository from '@/modules/users/repositories/session.repository.js';
import UserRepository from '@/modules/users/repositories/user.repository.js';
import { USERSTATUS } from '@/modules/users/types/user.types.js';
import dotenv from "dotenv"
dotenv.config()

interface DecodedToken {
  userId: string;
  email: string;
  username: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedUser {
  userId: string;
  email: string;
  username: string;
  roleId: string;
}

const sessionRepository = new SessionRepository()
const userRepository = new UserRepository()

// Validação do JWT_SECRET
const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
  }
  return jwtSecret;
};

export const authMiddleware = async (
  request: FastifyRequest
): Promise<void> => {
  const authHeader = request.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Token não fornecido', 'missing_token');
  }

  const token = authHeader.replace('Bearer ', '');
  const jwtSecret = getJwtSecret();

  let decoded: DecodedToken;

  try {
    // Correção do cast - use type assertion via unknown
    decoded = jwt.verify(token, jwtSecret) as unknown as DecodedToken;
  } catch (error) {
    throw new UnauthorizedException('Token inválido ou expirado', 'invalid_token');
  }

  const session = await sessionRepository.findValidSession(decoded.userId, token);

  if (!session) {
    throw new UnauthorizedException('Sessão inválida ou expirada', 'expired_token');
  }

  const user = await userRepository.findById(decoded.userId);

  if (!user || user.status === USERSTATUS.INATIVO) {
    throw new NotFoundException('Usuário não encontrado ou inativo', decoded.userId);
  }

  await sessionRepository.updateLastActivity(decoded.userId, token);

  request.user = {
    username: decoded.username,
    userId: decoded.userId,
    email: decoded.email,
    roleId: user.roleId,
  };
};

export const authMiddlewareResult = async (
  request: FastifyRequest
): Promise<Result<AuthenticatedUser, UnauthorizedError | NotFoundError>> => {
  const authHeader = request.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Err(ErrorFactory.unauthorized('Token não fornecido', 'missing_token', 'AuthMiddleware'));
  }

  const token = authHeader.replace('Bearer ', '');
  
  let jwtSecret: string;
  try {
    jwtSecret = getJwtSecret();
  } catch (error) {
    return Err(ErrorFactory.unauthorized('Configuração de servidor inválida'));
  }

  let decoded: DecodedToken;

  try {
    // Correção do cast
    decoded = jwt.verify(token, jwtSecret) as unknown as DecodedToken;
  } catch (error) {
    return Err(ErrorFactory.unauthorized('Token inválido ou expirado', 'invalid_token', 'AuthMiddleware'));
  }

  const session = await sessionRepository.findValidSession(decoded.userId, token);

  if (!session) {
    return Err(ErrorFactory.unauthorized('Sessão inválida ou expirada', 'expired_token', 'AuthMiddleware'));
  }

  const user = await userRepository.findById(decoded.userId);

  if (!user || user.status === USERSTATUS.INATIVO) {
    return Err(ErrorFactory.notFound('Usuário não encontrado ou inativo', 'User', decoded.userId, 'AuthMiddleware'));
  }

  await sessionRepository.updateLastActivity(decoded.userId, token);

  const authenticatedUser: AuthenticatedUser = {
    username: decoded.username,
    userId: decoded.userId,
    email: decoded.email,
    roleId: user.roleId,
  };

  request.user = authenticatedUser;

  return Ok(authenticatedUser);
};

export async function authResultHook(request: FastifyRequest, reply: FastifyReply) {
  const result = await authMiddlewareResult(request);

  if (!result.success) {
    const error = result.error;
    reply.status(error.statusCode || 401).send({
      error: {
        message: error.message,
        statusCode: error.statusCode,
        code: error.statusCode,
        component: error.component,
        timestamp: new Date().toISOString(),
      },
    });
    return reply; 
  }
  request.user = result.value;
}
import { FastifyRequest, FastifyReply } from "fastify";
import AuthService from "../services/auth.service.js";
import { IUserRepository, TLoginDTO } from "../types/user.types.js";
import { ISessionRepository } from "../types/session.types.js";
import { TCreateUserInput } from "../schemas/user.schema.js";
import { createNotificacaoService } from "@/modules/notifications/services/notification.service.js";
import { createNotificacaoRepository } from "@/modules/notifications/repositories/notification.repository.js";
import { CacheService } from "@/config/cache.js";
import { QueueService } from "@/config/queue.js";
import { EmailService } from "@/modules/notifications/services/email.service.js";
import UserRepository from "../repositories/user.repository.js";
import db from "@/config/database.js";
import RoleService from "@/modules/roles/services/role.service.js";
import RoleRepository from "@/modules/roles/repositories/role.repository.js";
  const userRepository = new UserRepository()
  const notificacaoRepository = createNotificacaoRepository(db)
  const notificacaoService = createNotificacaoService({
    repository: notificacaoRepository,
    userRepository: userRepository,
    cache: CacheService,
    queue: QueueService,
    emailService: EmailService
  });
export class AuthController {
  private service: AuthService;

  constructor(userRepository: IUserRepository, sessionRepository: ISessionRepository) {
    this.service = new AuthService(userRepository, sessionRepository, notificacaoService, new RoleService(new RoleRepository()));
  }

  async register(request: FastifyRequest<{ Body: TCreateUserInput }>, reply: FastifyReply) {
    const result = await this.service.register(request.body, request);
    return reply.code(201).send({
      status: "success",
      message: "Conta criada com sucesso",
      data: {
        access_token: result.token,
        user: result.user,
      },
    });
  }

  async resendVerification(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
    const { email } = request.body;
    await this.service.resendVerificationCode(email); 
    return reply.send({ status: "success", message: "Novo código enviado ao seu e-mail." });
  }


  async login(request: FastifyRequest<{ Body: TLoginDTO }>, reply: FastifyReply) {
    const { email, password } = request.body;
    const result = await this.service.login(email, password, request);
    return reply.code(200).send({
      status: "success",
      message: "Login realizado com sucesso",
      data: {
        access_token: result.token,
        user: result.user,
      },
    });
  }

  async loginWithGoogle(request: FastifyRequest<{ Body: { idToken: string } }>, reply: FastifyReply) {
    const { idToken } = request.body;
    const result = await this.service.loginWithGoogle(idToken, request); 
    return reply.code(200).send({
      status: "success",
      message: "Login com Google realizado com sucesso",
      data: {  
        access_token: result.token,
        user: result.user,
      },
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.userId;
    const token = request.headers['authorization']?.replace('Bearer ', '');
    if (!userId || !token) {
      return reply.code(401).send({
        status: "error",
        message: "Não autenticado",
      });
    }

    const result = await this.service.logout(userId, token);
    return reply.code(200).send({
      status: "success",
      message: result.message,
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.userId;
    if (!userId) {
      return reply.code(401).send({
        status: "error",
        message: "Não autenticado",
      });
    }

    const result = await this.service.getProfile(userId);
    return reply.code(200).send({
      status: "success",
      data: result.user,
    });
  }
}

export default AuthController;
import { FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ConflictException, UnauthorizedException, ValidationException, DomainException } from "@/utils/domain.js";
import { formatZodError } from "@/utils/formatZodError.js";
import User from "../models/user.model.js";
import { IUserRepository, TUserResponse, USERSTATUS } from "../types/user.types.js";
import { ISessionRepository } from "../types/session.types.js";
import { createUserSchema, TCreateUserInput } from "../schemas/user.schema.js";
import RoleRepository from "@/modules/roles/repositories/role.repository.js";
import { OAuth2Client } from 'google-auth-library';
import { QueueService } from "@/config/queue.js";
import { ActivityType, EntityType } from "@/modules/activity-log/types/activity-log.types.js";
import { NotificacaoService, TipoNotificacao } from "@/modules/notifications/types/notification.types.js";
import RoleService from "@/modules/roles/services/role.service.js";
import { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  private userRepository: IUserRepository;
  private sessionRepository: ISessionRepository;
  private notificationService: NotificacaoService;
  private roleService: RoleService

  constructor(
    userRepository: IUserRepository,
    sessionRepository: ISessionRepository,
    notificationService: NotificacaoService,
    roleService: RoleService
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.notificationService = notificationService;
    this.roleService = roleService
  }

  async register(data: TCreateUserInput, request: FastifyRequest) {
    const parseResult = createUserSchema.safeParse(data);
    if (!parseResult.success) {
      throw new ValidationException(formatZodError(parseResult.error), "AuthService.register");
    }

    if (await this.userRepository.findByEmail(data.email)) {
      throw new ConflictException("Email já está em uso.", "AuthService.register");
    }
    const role = await this.roleService.findByName("user")
    
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userId = await this.userRepository.create({
      ...data,
      roleId: role?.id,
      password: hashedPassword,
    });
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new DomainException("Falha ao registrar o usuário.", "AuthService.register");
    }

    const token = this.generateToken(user);
    await this.createSession(userId, token, request);

    QueueService.publish("activity_log", "user_registered", {
      userId: user.id,
      activityType: ActivityType.USER_REGISTRATION,
      entityType: EntityType.USER,
      entityId: user.id,
      description: `Novo usuário registrado: ${user.email}`,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    this.notificationService.create({
        userId: user.id,
        titulo: "Bem-vindo(a)!",
        mensagem: `Olá ${user.primeiroNome}, sua conta foi criada com sucesso. Aproveite nossa plataforma!`,
        tipo: TipoNotificacao.SISTEMA,
        enviarEmail: true,
    }).then(result => {
        if (!result.success) console.error("Falha ao criar notificação de boas-vindas", result.error);
    });

    return { success: true, user, token };
  }

  async loginWithGoogle(idToken: string, request: FastifyRequest) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException("Token do Google inválido", "AuthService");
      }

      const { email, given_name, family_name, picture } = payload;

      let user = await this.userRepository.findByEmail(email);
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const role = await new RoleRepository().findRolePadrao()
        const newUserInput: TCreateUserInput = {
          email: email,
          primeiroNome: given_name || "",
          ultimoNome: family_name || "",
          roleId: role.id,
          avatarUrl: picture || "",
          password: `google-sso-${Date.now()}`,
          status: "active",
        };

        const userId = await this.userRepository.create(newUserInput);
        user = await this.userRepository.findById(userId);
      }

      if (!user) {
        throw new DomainException("Falha ao encontrar ou criar utilizador com Google", "AuthService");
      }

      const token = this.generateToken(user);
      await this.createSession(user.id, token, request);

      // ** ACTIVITY LOG: Login Google **
      QueueService.publish("activity_log", "user_login_google", {
        userId: user.id,
        activityType: ActivityType.USER_LOGIN,
        entityType: EntityType.USER,
        entityId: user.id,
        description: isNewUser ? `Usuário registrado via Google: ${email}` : `Login via Google: ${email}`,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
        metadata: { provider: 'google', isNewUser }
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: email,
          primeiroNome: given_name || "",
          ultimoNome: family_name || "",
          avatarUrl: user.avatarUrl,
        },
        token,
      };
    } catch (error) {
      console.error("Erro na autenticação com Google:", error);
      throw new UnauthorizedException("Falha na autenticação com Google", "AuthService");
    }
  }

  async login(email: string, password: string, request: FastifyRequest) {
    if (!email || !password) {
      throw new ValidationException("Email e senha são obrigatórios.", "AuthService.login");
    }

    const userWithPassword = await this.userRepository.findByEmailWithPassword(email);
    if (!userWithPassword) {
      throw new UnauthorizedException("Credenciais inválidas.", "AuthService.login");
    }

    if (userWithPassword.status === USERSTATUS.INATIVO) {
      throw new UnauthorizedException("Esta conta está inativa.", "AuthService.login");
    }

    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas.", "AuthService.login");
    }

    await this.userRepository.updateLastLogin(userWithPassword.id);

    const user = new User(userWithPassword).toJSON();
    const token = this.generateToken(user);
    await this.createSession(user.id, token, request);

    // ** ACTIVITY LOG: Login Sucesso **
    QueueService.publish("activity_log", "user_login", {
        userId: user.id,
        activityType: ActivityType.USER_LOGIN,
        entityType: EntityType.USER,
        entityId: user.id,
        description: `Usuário realizou login via credenciais.`,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
    });

    return { success: true, user, token };
  }

  async logout(userId: string, token: string, ipAddress?: string, userAgent?: string) {
    await this.sessionRepository.deleteSession(userId, token);

    // ** ACTIVITY LOG: Logout **
    QueueService.publish("activity_log", "user_logout", {
        userId: userId,
        activityType: ActivityType.USER_LOGOUT, 
        entityType: EntityType.SESSION,
        description: `Usuário realizou logout.`,
        ipAddress: ipAddress,
        userAgent: userAgent
    });

    return { success: true, message: "Logout realizado com sucesso." };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException("Usuário não encontrado.", "AuthService.getProfile");
    }
    return { success: true, user };
  }

  async createSession(userId: string, token: string, request: FastifyRequest) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"] || "unknown";
    const deviceInfo = { agent: userAgent };

    await this.sessionRepository.createSession(userId, token, ipAddress, userAgent, deviceInfo, expiresAt);
  }

  generateToken(user: TUserResponse): string {
    const jwtSecret = process.env.JWT_SECRET || "";
    return jwt.sign({ userId: user.id, email: user.email, roleId: user.roleId }, jwtSecret, { expiresIn: "1d" });
  }

    async resendVerificationCode(email: string): Promise<void> {
      const user = await this.userRepository.findByEmail(email);
      if (!user) throw new DomainException("Usuário não encontrado.", "AuthService.resendVerificationCode");
  
      if (user.status === "ativo") {
        throw new ValidationException("E-mail já verificado.", "AuthService.resendVerificationCode");
      }
  
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
      const verificationRepo = new EmailVerificationRepository();
      await verificationRepo.create(user.id, code, expiresAt);
  
      QueueService.publish("email", "send_verification", {
        templateName: "email_verification",
        to: email,
        data: { nomeUsuario: user.primeiroNome, code, expiresIn: "10 minutos" },
      });
    }
}

export default AuthService;
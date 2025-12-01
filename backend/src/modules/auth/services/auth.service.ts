// // src/modules/auth/services/auth.service.ts
// import { FastifyRequest } from "fastify";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { ConflictException, UnauthorizedException, ValidationException, DomainException } from "@/utils/domain.js";
// import { formatZodError } from "@/utils/formatZodError.js";
// import User from "@/modules/users/models/user.model.js";
// import { IUserRepository, TUserResponse, TLoginDTO, USERSTATUS } from "@/modules/users/types/user.types.js";
// import { ISessionRepository } from "@/modules/users/types/session.types.js";
// import { createUserSchema, TCreateUserInput } from "@/modules/users/schemas/user.schema.js";
// import { QueueService } from "@/config/queue.js";
// import { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
// import db from "@/config/database.js";
// import { OAuth2Client } from "google-auth-library";
// import { ActivityType, EntityType } from "@/modules/activity-log/types/activity-log.types.js";
// import { TipoNotificacao } from "@/modules/notifications/types/notification.types.js";
// import { logger } from "@/utils/logger.js";

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export class AuthService {
//   private userRepository: IUserRepository;
//   private sessionRepository: ISessionRepository;

//   constructor(userRepository: IUserRepository, sessionRepository: ISessionRepository) {
//     this.userRepository = userRepository;
//     this.sessionRepository = sessionRepository;
//   }

//   async register(data: TCreateUserInput, request: FastifyRequest) {
//     const parseResult = createUserSchema.safeParse(data);
//     if (!parseResult.success) {
//       throw new ValidationException(formatZodError(parseResult.error), "AuthService.register");
//     }

//     if (await this.userRepository.findByEmail(data.email)) {
//       throw new ConflictException("Email já está em uso.", "AuthService.register");
//     }

//     const hashedPassword = await bcrypt.hash(data.password, 12);
//     const userId = await this.userRepository.create({
//       ...data,
//       password: hashedPassword,
//     });

//     const user = await this.userRepository.findById(userId);
//     if (!user) {
//       throw new DomainException("Falha ao registrar o usuário.", "AuthService.register");
//     }

//     // --- GERAR E ENVIAR CÓDIGO OTP ---
//     //const code = String(Math.floor(100000 + Math.random() * 900000));
//     //const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

//    // const verificationRepo = new EmailVerificationRepository();
//     //await verificationRepo.create(userId, code, expiresAt);

//     //QueueService.publish("send_email", "verification_code", {
//      // to: data.email,
//      // subject: "Verifique seu e-mail – Código de acesso",
//       //template: "verification-code",
//      // context: {
//      //   name: data.primeiroNome,
//      //   code,
//      //   expiresIn: "10 minutos",
//      // },
//    // });

//     // Marcar como pendente
//     //await db.query(
//       //`UPDATE users SET email_verificado = FALSE, status = 'pendente' WHERE id = $1`,
//      // [userId]
//     //);
//     // Após criar o usuário
// await db.query(
//   `UPDATE users SET email_verificado = TRUE, status = 'ativo' WHERE id = $1`,
//   [userId]
// );
// // --- GERAR E SALVAR OTP ---
// const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
// const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

// const verificationRepo = new EmailVerificationRepository();
// await verificationRepo.create(userId, code, expiresAt);

// // --- MARCAR COMO PENDENTE ---
// await db.query(
//   `UPDATE users SET 
//     email_verificado = FALSE, 
//     status = 'pendente' 
//    WHERE id = $1`,
//   [userId]
// );
// console.log("OTP GERADO E SALVO:", { userId, code, expiresAt });
//     const token = this.generateToken(user);
//     await this.createSession(userId, token, request);

//     QueueService.publish("email", "send_verification", {
//   templateName: "email_verification",
//   to: data.email,
//   data: {
//     name: data.primeiroNome,
//     code,
//     expiresIn: "10 minutos",
//   },
// });

// console.log("E-MAIL DE VERIFICAÇÃO NA FILA:", data.email, code);
//     // Activity Log
//     QueueService.publish("activity_log", "user_registered", {
//       userId: user.id,
//       activityType: ActivityType.USER_REGISTRATION,
//       entityType: EntityType.USER,
//       entityId: user.id,
//       description: `Novo usuário registrado: ${user.email}`,
//       ipAddress: request.ip,
//       userAgent: request.headers["user-agent"],
//     });

//     return { success: true, user, token };
//   }

//   async login(email: string, password: string, request: FastifyRequest) {
//     if (!email || !password) {
//       throw new ValidationException("Email e senha são obrigatórios.", "AuthService.login");
//     }

//     const userWithPassword = await this.userRepository.findByEmailWithPassword(email);
//     if (!userWithPassword) {
//       throw new UnauthorizedException("Credenciais inválidas.", "AuthService.login");
//     }

//     if (userWithPassword.status === USERSTATUS.INATIVO) {
//       throw new UnauthorizedException("Esta conta está inativa.", "AuthService.login");
//     }

//     const isPasswordValid = await bcrypt.compare(password, userWithPassword.password_hash);
//     if (!isPasswordValid) {
//       throw new UnauthorizedException("Credenciais inválidas.", "AuthService.login");
//     }

//     await this.userRepository.updateLastLogin(userWithPassword.id);

//     const user = new User(userWithPassword).toJSON();
//     const token = this.generateToken(user);
//     await this.createSession(user.id, token, request);

//     // Activity Log
//     QueueService.publish("activity_log", "user_login", {
//       userId: user.id,
//       activityType: ActivityType.USER_LOGIN,
//       entityType: EntityType.USER,
//       entityId: user.id,
//       description: `Login via credenciais.`,
//       ipAddress: request.ip,
//       userAgent: request.headers["user-agent"],
//     });

//     return { success: true, user, token };
//   }

//   async loginWithGoogle(idToken: string, request: FastifyRequest) {
//     try {
//       const ticket = await client.verifyIdToken({
//         idToken,
//         audience: process.env.GOOGLE_CLIENT_ID,
//       });

//       const payload = ticket.getPayload();
//       if (!payload || !payload.email) {
//         throw new UnauthorizedException("Token do Google inválido", "AuthService");
//       }

//       const { email, given_name, family_name, picture } = payload;

//       let user = await this.userRepository.findByEmail(email);
//       let isNewUser = false;

//       if (!user) {
//         isNewUser = true;
//         const newUserInput: TCreateUserInput = {
//           email,
//           primeiroNome: given_name || "",
//           ultimoNome: family_name || "",
//           avatarUrl: picture || "",
//           password: `google-sso-${Date.now()}`,
//           roleId: " 019a7c7a-6d7a-7538-8f43-adbc49a2353f ", // Ajuste conforme seu sistema
//           status: "ativo",
//         };

//         const userId = await this.userRepository.create(newUserInput);
//         user = await this.userRepository.findById(userId);
//       }

//       if (!user) {
//         throw new DomainException("Falha ao processar login com Google", "AuthService");
//       }

//       const token = this.generateToken(user);
//       await this.createSession(user.id, token, request);

//       QueueService.publish("activity_log", "user_login_google", {
//         userId: user.id,
//         activityType: ActivityType.USER_LOGIN,
//         entityType: EntityType.USER,
//         entityId: user.id,
//         description: isNewUser ? `Registrado via Google: ${email}` : `Login via Google: ${email}`,
//         ipAddress: request.ip,
//         userAgent: request.headers["user-agent"],
//         metadata: { provider: "google", isNewUser },
//       });

//       return { success: true, user, token };
//     } catch (error) {
//       console.error("Erro na autenticação com Google:", error);
//       throw new UnauthorizedException("Falha na autenticação com Google", "AuthService");
//     }
//   }

//   async logout(userId: string, token: string, ipAddress?: string, userAgent?: string) {
//     await this.sessionRepository.deleteSession(userId, token);

//     QueueService.publish("activity_log", "user_logout", {
//       userId,
//       activityType: ActivityType.USER_LOGOUT,
//       entityType: EntityType.SESSION,
//       description: `Usuário realizou logout.`,
//       ipAddress,
//       userAgent,
//     });

//     return { success: true, message: "Logout realizado com sucesso." };
//   }

//   async getProfile(userId: string) {
//     const user = await this.userRepository.findById(userId);
//     if (!user) {
//       throw new DomainException("Usuário não encontrado.", "AuthService.getProfile");
//     }
//     return { success: true, user };
//   }

//   private generateToken(user: TUserResponse): string {
//     const jwtSecret = process.env.JWT_SECRET || "";
//     return jwt.sign(
//       { userId: user.id, email: user.email, roleId: user.roleId },
//       jwtSecret,
//       { expiresIn: "1d" }
//     );
//   }

//   private async createSession(userId: string, token: string, request: FastifyRequest) {
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     const ipAddress = request.ip;
//     const userAgent = request.headers["user-agent"] || "unknown";
//     const deviceInfo = { agent: userAgent };

//     await this.sessionRepository.createSession(
//       userId,
//       token,
//       ipAddress,
//       userAgent,
//       deviceInfo,
//       expiresAt
//     );
//   }

//   async resendVerificationCode(email: string): Promise<void> {
//     const user = await this.userRepository.findByEmail(email);
//     if (!user) throw new DomainException("Usuário não encontrado.", "AuthService.resendVerificationCode");

//     if (user.status === "ativo") {
//       throw new ValidationException("E-mail já verificado.", "AuthService.resendVerificationCode");
//     }

//     const code = String(Math.floor(100000 + Math.random() * 900000));
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     const verificationRepo = new EmailVerificationRepository();
//     await verificationRepo.create(user.id, code, expiresAt);

//     QueueService.publish("email", "send_verification", {
//       templateName: "email_verification",
//       to: email,
//       data: { nomeUsuario: user.primeiroNome, code, expiresIn: "10 minutos" },
//     });

//     logger.info(`[AuthService] Novo código enviado para: ${email}`);
//   }
// }


// export default AuthService;
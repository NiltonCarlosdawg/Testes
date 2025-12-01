// // src/modules/auth/controllers/auth.controller.ts
// import { FastifyRequest, FastifyReply } from "fastify";
// import AuthService from "@/modules/auth/services/auth.service.js";
// import { TCreateUserInput } from "@/modules/users/schemas/user.schema.js";
// import { TLoginDTO } from "@/modules/users/types/user.types.js";
// import { verifyEmailSchema } from "../schemas/verify-email.schema.js";
// import { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
// import { UnauthorizedException, ValidationException } from "@/utils/domain.js";
// import { formatZodError } from "@/utils/formatZodError.js";
// import db from "@/config/database.js";
// import UserRepository from "@/modules/users/repositories/user.repository.js";
// import SessionRepository from "@/modules/users/repositories/session.repository.js";

// const userRepository = new UserRepository();
// const sessionRepository = new SessionRepository();
// const authService = new AuthService(userRepository, sessionRepository);

// export class AuthController {
//   private service = authService;

//   async register(request: FastifyRequest<{ Body: TCreateUserInput }>, reply: FastifyReply) {
//     const result = await this.service.register(request.body, request);
//     return reply.code(201).send({
//       status: "success",
//       message: "Conta criada com sucesso. Verifique seu e-mail.",
//       data: {
//         access_token: result.token,
//         user: result.user,
//       },
//     });
//   }

//   async login(request: FastifyRequest<{ Body: TLoginDTO }>, reply: FastifyReply) {
//     const { email, password } = request.body;
//     const result = await this.service.login(email, password, request);
//     return reply.code(200).send({
//       status: "success",
//       message: "Login realizado com sucesso",
//       data: {
//         access_token: result.token,
//         user: result.user,
//       },
//     });
//   }


// async resendVerification(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
//   const { email } = request.body;
//   await this.service.resendVerificationCode(email); 
//   return reply.send({ status: "success", message: "Novo código enviado ao seu e-mail." });
// }


//   async loginWithGoogle(request: FastifyRequest<{ Body: { idToken: string } }>, reply: FastifyReply) {
//     const { idToken } = request.body;
//     const result = await this.service.loginWithGoogle(idToken, request);
//     return reply.code(200).send({
//       status: "success",
//       message: "Login com Google realizado com sucesso",
//       data: {
//         access_token: result.token,
//         user: result.user,
//       },
//     });
//   }

//   async logout(request: FastifyRequest, reply: FastifyReply) {
//     const userId = request.user?.userId;
//     const token = request.headers["authorization"]?.replace("Bearer ", "");
//     if (!userId || !token) {
//       return reply.code(401).send({
//         status: "error",
//         message: "Não autenticado",
//       });
//     }

//     const result = await this.service.logout(userId, token);
//     return reply.code(200).send({
//       status: "success",
//       message: result.message,
//     });
//   }

//   async me(request: FastifyRequest, reply: FastifyReply) {
//     const userId = request.user?.userId;
//     if (!userId) {
//       return reply.code(401).send({
//         status: "error",
//         message: "Não autenticado",
//       });
//     }

//     const result = await this.service.getProfile(userId);
//     return reply.code(200).send({
//       status: "success",
//       data: result.user,
//     });
//   }

//   async verifyEmail(request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply) {
//     const userId = request.user?.userId;
//     if (!userId) throw new UnauthorizedException("Não autenticado");

//     const parse = verifyEmailSchema.safeParse(request.body);
//     if (!parse.success) {
//       throw new ValidationException(formatZodError(parse.error));
//     }

//     const { code } = parse.data;
//     const repo = new EmailVerificationRepository();

//     const isValid = await repo.findValid(userId, code);
//     if (!isValid) {
//       throw new ValidationException("Código inválido ou expirado");
//     }

//     await Promise.all([
//       db.query(`UPDATE users SET email_verificado = TRUE, status = 'ativo' WHERE id = $1`, [userId]),
//       repo.markAsUsed(userId, code),
//     ]);

//     return reply.code(200).send({
//       status: "success",
//       message: "E-mail verificado com sucesso!",
//     });
//   }
// }

// export default AuthController;
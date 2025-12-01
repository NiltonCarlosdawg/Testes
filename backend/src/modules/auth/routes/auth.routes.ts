// // src/modules/auth/routes/auth.routes.ts
// import { FastifyInstance } from "fastify";
// import { authMiddleware } from "@/middleware/auth.middleware.js";
// import { AuthService } from "../services/auth.service.js";
// import { AuthController } from "../controllers/auth.controller.js";
// import UserRepository from "@/modules/users/repositories/user.repository.js";
// import SessionRepository from "@/modules/users/repositories/session.repository.js";
// import { resendVerificationSchema } from "../schemas/resend-verification.schema.js";

// const userRepo = new UserRepository();
// const sessionRepo = new SessionRepository();
// const authService = new AuthService(userRepo, sessionRepo); // ← CRIE A INSTÂNCIA
// const controller = new AuthController(authService);         // ← PASSE A INSTÂNCIA

// export const authRoutes = async (fastify: FastifyInstance) => {
//   fastify.post("/register", controller.register.bind(controller));
//   fastify.post("/login", controller.login.bind(controller));
//   fastify.post("/login/google", controller.loginWithGoogle.bind(controller));

//   fastify.post(
//     "/resend-verification",
//     {
//       schema: { body: resendVerificationSchema },
//       config: { rateLimit: { max: 1, timeWindow: "1 minute" } }, // ← AQUI
//     },
//     controller.resendVerification.bind(controller)
//   );

//   fastify.register(async (protectedRoutes) => {
//     protectedRoutes.addHook("preHandler", authMiddleware);
//     protectedRoutes.get("/me", controller.me.bind(controller));
//     protectedRoutes.post("/logout", controller.logout.bind(controller));
//     protectedRoutes.post("/verify-email", controller.verifyEmail.bind(controller));
//   });
// };

// export default authRoutes;
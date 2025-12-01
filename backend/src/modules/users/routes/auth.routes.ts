import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import UserRepository from "../repositories/user.repository.js";
import SessionRepository from "../repositories/session.repository.js";
import AuthController from "../controllers/auth.controller.js";
import { resendVerificationSchema } from "@/modules/auth/schemas/resend-verification.schema.js";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const controller = new AuthController(userRepository, sessionRepository);

export const AuthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post("/register", controller.register.bind(controller));
  fastify.post("/login",controller.login.bind(controller) );
  fastify.post("/login/google", controller.loginWithGoogle.bind(controller)); 
  fastify.post(
    "/resend-verification",
    {
      schema: { body: resendVerificationSchema },
      config: { rateLimit: { max: 1, timeWindow: "1 minute" } },
    },
    controller.resendVerification.bind(controller)
  );

  fastify.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook("preHandler", authMiddleware);
    authenticatedRoutes.get("/me", controller.me.bind(controller));
    authenticatedRoutes.post("/logout", controller.logout.bind(controller));
  });
};

export default AuthRoutes;
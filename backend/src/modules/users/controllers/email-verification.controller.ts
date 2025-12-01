import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { formatZodError } from "@/utils/formatZodError.js";

export const EmailVerificationService = () => {
  return {
    async sendVerificationCode(userId: string) {
      // implementar lógica real
      return { success: true, message: "Código enviado", userId };
    },

    async verifyCode(userId: string, code: string) {
      // implementar lógica real
      return { success: true, message: "Código verificado", userId, code };
    },

    async isEmailVerified(userId: string) {
      // lógica real (ex: consultar BD)
      return userId;
    },
  };
};

export type EmailVerificationService = ReturnType<typeof EmailVerificationService>;

// ---------------------------
// Zod Schema
// ---------------------------

export const verifyEmailCodeSchema = z.object({
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});


// ---------------------------
// Controller
// ---------------------------

export class EmailVerificationController {
  private verificationService: EmailVerificationService;

  constructor(verificationService: EmailVerificationService) {
    this.verificationService = verificationService;
  }

  async sendVerificationCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).userId;
      const result = await this.verificationService.sendVerificationCode(userId);
      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Erro ao enviar código",
      });
    }
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).userId;

      const parseResult = verifyEmailCodeSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply
          .status(400)
          .send({ success: false, message: formatZodError(parseResult.error) });
      }

      const { code } = parseResult.data;
      const result = await this.verificationService.verifyCode(userId, code);

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Erro ao verificar código",
      });
    }
  }

  async getVerificationStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).userId;
      const isVerified = await this.verificationService.isEmailVerified(userId);

      return reply.status(200).send({
        success: true,
        emailVerified: isVerified,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao verificar status",
      });
    }
  }
}

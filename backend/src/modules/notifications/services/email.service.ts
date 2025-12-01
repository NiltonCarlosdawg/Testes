import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import {
  renderEmailTemplate,
  EmailTemplateName,
  NewNotificationData,
  WelcomeData,
  PasswordResetData,
  EmailVerificationData,
  OrderConfirmationData,
} from "../../email/email.templates.js";

const COMPONENT = "EmailService";

type TemplateData<T extends EmailTemplateName> = T extends "new_notification"
  ? NewNotificationData
  : T extends "welcome"
  ? WelcomeData
  : T extends "password_reset"
  ? PasswordResetData
  : T extends "email_verification"
  ? EmailVerificationData
  : T extends "order_confirmation"
  ? OrderConfirmationData
  : never;

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
}

export interface IEmailService {
  sendEmail: <T extends EmailTemplateName>(
    templateName: T,
    to: string,
    data: TemplateData<T>
  ) => Promise<EmailSendResult>;
  sendRawEmail: (options: SendMailOptions) => Promise<EmailSendResult>;
  verifyConnection: () => Promise<boolean>;
}

const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  });
};

let transporter: Transporter;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = createTransporter();
    transporter
      .verify()
      .then(() => {
        logger.info(`[${COMPONENT}] Conexão com servidor de email estabelecida com sucesso`);
      })
      .catch((error) => {
        logger.error(`[${COMPONENT}] Falha ao conectar com servidor de email:`, error);
      });
  }
  return transporter;
};

export const EmailService: IEmailService = {
  /**
   * Envia um e-mail usando um template pré-definido.
   */
  sendEmail: async <T extends EmailTemplateName>(
    templateName: T,
    to: string,
    data: TemplateData<T>
  ): Promise<EmailSendResult> => {
    try {
      const { subject, html, text } = renderEmailTemplate(templateName, data);

      const mailOptions: SendMailOptions = {
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      };

      const info = await getTransporter().sendMail(mailOptions);

      logger.info(`[${COMPONENT}] Email enviado (${templateName}) para ${to}. Message ID: ${info.messageId}`);

      if (env.EMAIL_HOST.includes("ethereal.email")) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`[${COMPONENT}] Preview (Ethereal): ${previewUrl}`);
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      };
    } catch (error) {
      const errorMessage = `Falha ao enviar email (${templateName}) para ${to}: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`;
      logger.error(`[${COMPONENT}] ${errorMessage}`, error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Envia um email personalizado sem usar templates
   */
  sendRawEmail: async (options: SendMailOptions): Promise<EmailSendResult> => {
    try {
      const mailOptions: SendMailOptions = {
        from: env.EMAIL_FROM,
        ...options,
      };

      const info = await getTransporter().sendMail(mailOptions);

      logger.info(`[${COMPONENT}] Email personalizado enviado para ${options.to}. Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      };
    } catch (error) {
      const errorMessage = `Falha ao enviar email personalizado: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`;
      logger.error(`[${COMPONENT}] ${errorMessage}`, error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Verifica a conexão com o servidor de email
   */
  verifyConnection: async (): Promise<boolean> => {
    try {
      await getTransporter().verify();
      logger.info(`[${COMPONENT}] Conexão com servidor de email verificada com sucesso`);
      return true;
    } catch (error) {
      logger.error(`[${COMPONENT}] Falha ao verificar conexão com servidor de email:`, error);
      return false;
    }
  },
};

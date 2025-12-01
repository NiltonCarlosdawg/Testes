import { SendMailOptions } from "nodemailer";
import type {
  NewNotificationData,
  WelcomeData,
  PasswordResetData,
  EmailVerificationData,
  OrderConfirmationData,
  EmailTemplateName
} from "./email.templates.js"; 

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
}

export type TemplateData<T extends EmailTemplateName> = 
  T extends 'new_notification' ? NewNotificationData :
  T extends 'welcome' ? WelcomeData :
  T extends 'password_reset' ? PasswordResetData :
  T extends 'email_verification' ? EmailVerificationData :
  T extends 'order_confirmation' ? OrderConfirmationData :
  never;

export interface IEmailService {
  sendEmail: <T extends EmailTemplateName>(
    templateName: T,
    to: string,
    data: TemplateData<T>
  ) => Promise<EmailSendResult>;
  sendRawEmail: (options: SendMailOptions) => Promise<EmailSendResult>;
  verifyConnection: () => Promise<boolean>;
}

export type {
  NewNotificationData,
  WelcomeData,
  PasswordResetData,
  EmailVerificationData,
  OrderConfirmationData,
  EmailTemplateName
};
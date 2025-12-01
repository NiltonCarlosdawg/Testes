import Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface NewNotificationData {
  titulo: string;
  mensagem?: string;
  tipo: string;
  nomeUsuario: string;
  link?: string;
}

export interface WelcomeData {
  nomeUsuario: string;
  email: string;
  loginUrl?: string;
}

export interface PasswordResetData {
  nomeUsuario: string;
  resetLink: string;
  expiresIn?: string;
}

export interface EmailVerificationData {
  nomeUsuario: string;
  verificationLink: string;
  expiresIn?: string;
}

export interface OrderConfirmationData {
  nomeUsuario: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingUrl?: string;
}

export interface EmailTemplate<T> {
  (data: T): {
    subject: string;
    html: string;
    text: string;
  };
}

Handlebars.registerHelper('formatCurrency', function(value: number) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

const TEMPLATES_DIR = path.join(__dirname, 'templates');

function loadTemplate(filename: string): string {
  const filePath = path.join(TEMPLATES_DIR, filename);
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Erro ao carregar template ${filename}: ${error}`);
  }
}

const baseTemplate = loadTemplate('base.handlebars');
const newNotificationContent = loadTemplate('notification.handlebars');
const welcomeContent = loadTemplate('welcome.handlebars');
const passwordResetContent = loadTemplate('password-reset.handlebars');
const emailVerificationContent = loadTemplate('email-verification.handlebars');
const orderConfirmationContent = loadTemplate('order-confirmation.handlebars');

const compileBaseTemplate = Handlebars.compile(baseTemplate);

export const templates = {
  new_notification: (data: NewNotificationData) => {
    const content = Handlebars.compile(newNotificationContent)(data);
    const html = compileBaseTemplate({
      companyName: 'CalungaSOFT',
      subject: `Nova Notificação: ${data.titulo}`,
      content
    });

    return {
      subject: `[Notificação] ${data.titulo}`,
      html,
      text: `Olá, ${data.nomeUsuario}!\n\nVocê tem uma nova notificação: ${data.titulo}\n\n${data.mensagem || ''}\n\n${data.link ? `Link: ${data.link}` : ''}`
    };
  },

  welcome: (data: WelcomeData) => {
    const content = Handlebars.compile(welcomeContent)(data);
    const html = compileBaseTemplate({
      companyName: 'CalungaSOFT',
      subject: `Bem-vindo(a), ${data.nomeUsuario}!`,
      content
    });

    return {
      subject: `Bem-vindo(a) à CalungaSOFT!`,
      html,
      text: `Bem-vindo(a), ${data.nomeUsuario}!\n\nEstamos muito felizes em ter você conosco! Sua conta foi criada com sucesso.\n\nEmail cadastrado: ${data.email}\n\n${data.loginUrl ? `Acesse: ${data.loginUrl}` : ''}`
    };
  },

  password_reset: (data: PasswordResetData) => {
    const content = Handlebars.compile(passwordResetContent)(data);
    const html = compileBaseTemplate({
      companyName: 'CalungaSOFT',
      subject: 'Redefinição de Senha',
      content
    });

    return {
      subject: 'Redefinição de Senha - CalungaSOFT',
      html,
      text: `Olá, ${data.nomeUsuario}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta.\n\nClique no link abaixo para redefinir sua senha:\n${data.resetLink}\n\nEste link expira em ${data.expiresIn || '1 hora'}.\n\nSe você não solicitou esta redefinição, ignore este email.`
    };
  },

  email_verification: (data: EmailVerificationData) => {
    const content = Handlebars.compile(emailVerificationContent)(data);
    const html = compileBaseTemplate({
      companyName: 'CalungaSOFT',
      subject: 'Verificação de Email',
      content
    });

    return {
      subject: 'Verifique seu Email - CalungaSOFT',
      html,
      text: `Olá, ${data.nomeUsuario}!\n\nPor favor, verifique seu email clicando no link abaixo:\n${data.verificationLink}\n\n${data.expiresIn ? `Este link expira em ${data.expiresIn}` : ''}`
    };
  },

  order_confirmation: (data: OrderConfirmationData) => {
    const content = Handlebars.compile(orderConfirmationContent)(data);
    const html = compileBaseTemplate({
      companyName: 'CalungaSOFT',
      subject: `Pedido #${data.orderNumber} Confirmado`,
      content
    });

    const formatCurrency = Handlebars.helpers.formatCurrency as (value: number) => string;

    if (typeof formatCurrency !== 'function') {
      throw new Error("Handlebars helper 'formatCurrency' não está registrado ou é inválido.");
    }
    
    const itemsText = data.items
      .map(item => `- ${item.name} (x${item.quantity}) - ${formatCurrency(item.price)}`)
      .join('\n');

    return {
      subject: `Pedido #${data.orderNumber} Confirmado!`,
      html,
      text: `Olá, ${data.nomeUsuario}!\n\nSeu pedido foi confirmado!\n\nNúmero do Pedido: #${data.orderNumber}\nData: ${data.orderDate}\n\nItens:\n${itemsText}\n\nSubtotal: ${formatCurrency(data.subtotal)}\nFrete: ${formatCurrency(data.shipping)}\nImpostos: ${formatCurrency(data.tax)}\nTotal: ${formatCurrency(data.total)}\n\nEndereço de Entrega:\n${data.shippingAddress.street}\n${data.shippingAddress.city}, ${data.shippingAddress.state}\nCEP: ${data.shippingAddress.zipCode}\n\n${data.trackingUrl ? `Rastreie seu pedido: ${data.trackingUrl}` : ''}`
    };
  }
};

export type EmailTemplateName = keyof typeof templates;

/**
 * Envia um email usando um template específico
 * @param templateName Nome do template a ser usado
 * @param data Dados para popular o template
 * @returns Objeto com subject, html e text do email
 */
export function renderEmailTemplate<T extends EmailTemplateName>(
  templateName: T,
  data: T extends 'new_notification' ? NewNotificationData
    : T extends 'welcome' ? WelcomeData
    : T extends 'password_reset' ? PasswordResetData
    : T extends 'email_verification' ? EmailVerificationData
    : T extends 'order_confirmation' ? OrderConfirmationData
    : never
) {
  const template = templates[templateName];
  return template(data as any);
}

export async function sendEmail<T extends EmailTemplateName>(
  templateName: T,
  data: Parameters<typeof renderEmailTemplate<T>>[1],
  to: string,
  transporter: any 
) {
  const emailContent = renderEmailTemplate(templateName, data);
  
  return await transporter.sendMail({
    from: '"CalungaSOFT" <noreply@eddiendulo@gmail.com.com>',
    to,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  });
}
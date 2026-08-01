/** Contratos de notificação (implementados na Fase 6). */
export interface SendResult {
  sent: boolean;
  providerId?: string;
  reason?: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  name: "smtp" | "resend" | "sendgrid";
  send(message: EmailMessage): Promise<SendResult>;
}

export interface WhatsAppMessage {
  to: string;
  body: string;
}

export interface WhatsAppProvider {
  name: "meta-cloud" | "evolution";
  send(message: WhatsAppMessage): Promise<SendResult>;
}

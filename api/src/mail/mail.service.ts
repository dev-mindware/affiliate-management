import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private transporterInitialized = false;

  // Cria o transporter de forma preguiçosa; se o SMTP não estiver configurado,
  // regista um aviso e opera em modo no-op (não lança erros).
  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporterInitialized) return this.transporter;
    this.transporterInitialized = true;

    const host = process.env.MAIL_SERVER;
    const user = process.env.MAIL_USERNAME;
    const pass = process.env.MAIL_PASSWORD;

    if (!host || !user || !pass) {
      this.logger.warn("MAIL_* nao configurado. Envio de emails desativado.");
      return null;
    }

    const port = Number(process.env.MAIL_PORT || 587);
    const secure = String(process.env.MAIL_SSL_TLS).toLowerCase() === "true";

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    return this.transporter;
  }

  private get defaultFrom(): string {
    return process.env.MAIL_FROM || process.env.MAIL_USERNAME || "noreply@mindware.ao";
  }

  private formatValor(valor: any): string {
    const num = Number(valor || 0);
    try {
      return `${new Intl.NumberFormat("pt-AO").format(num)} Kz`;
    } catch {
      return `${num} Kz`;
    }
  }

  private formatData(date: any): string {
    try {
      return new Intl.DateTimeFormat("pt-AO", { dateStyle: "short", timeStyle: "short" }).format(
        date ? new Date(date) : new Date(),
      );
    } catch {
      return String(date || "");
    }
  }

  private async send(options: {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: MailAttachment[];
  }): Promise<void> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) return;
      const recipients = Array.isArray(options.to) ? options.to.filter(Boolean) : options.to;
      if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
        this.logger.warn("Nenhum destinatario definido para o email. Ignorado.");
        return;
      }
      await transporter.sendMail({
        from: this.defaultFrom,
        to: recipients,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });
    } catch (error) {
      // Falha de email nunca deve quebrar o fluxo de negocio.
      this.logger.error(`Falha ao enviar email: ${(error as Error)?.message}`, (error as Error)?.stack);
    }
  }

  // Notifica os administradores sobre um novo pedido de levantamento.
  async sendWithdrawalRequestedToAdmins(affiliate: any, withdrawal: any): Promise<void> {
    const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS || "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      this.logger.warn("ADMIN_NOTIFICATION_EMAILS nao configurado. Email de novo pedido ignorado.");
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Novo pedido de levantamento</h2>
        <p>Foi submetido um novo pedido de levantamento que aguarda aprovacao.</p>
        <table style="border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0;"><strong>Afiliado:</strong></td><td>${affiliate?.nomeCompleto || "-"}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0;"><strong>Email:</strong></td><td>${affiliate?.email || "-"}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0;"><strong>Valor:</strong></td><td>${this.formatValor(withdrawal?.valor)}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0;"><strong>Banco:</strong></td><td>${withdrawal?.banco || "-"}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0;"><strong>Conta:</strong></td><td>${withdrawal?.contaBancaria || "-"}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0;"><strong>Data:</strong></td><td>${this.formatData(withdrawal?.createdAt)}</td></tr>
        </table>
      </div>
    `;

    await this.send({ to: recipients, subject: "Novo pedido de levantamento", html });
  }

  // Confirma ao afiliado que o levantamento foi aprovado; anexa o comprovativo se fornecido.
  async sendWithdrawalApproved(affiliate: any, withdrawal: any, attachment?: MailAttachment): Promise<void> {
    if (!affiliate?.email) return;
    const appUrl = process.env.APP_AFFILIATE_URL || "";

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Levantamento aprovado</h2>
        <p>Ola ${affiliate?.nomeCompleto || ""},</p>
        <p>O seu pedido de levantamento no valor de <strong>${this.formatValor(withdrawal?.valor)}</strong> foi aprovado e processado com sucesso.</p>
        ${attachment ? "<p>Em anexo encontra o comprovativo da transferencia.</p>" : ""}
        ${appUrl ? `<p><a href="${appUrl}" style="color: #16a34a;">Aceder ao portal do afiliado</a></p>` : ""}
        <p>Obrigado por fazer parte do Mindware Affiliate System.</p>
      </div>
    `;

    await this.send({
      to: affiliate.email,
      subject: "Levantamento aprovado",
      html,
      attachments: attachment ? [attachment] : undefined,
    });
  }

  // Informa o afiliado que o levantamento foi rejeitado e que o saldo foi devolvido.
  async sendWithdrawalRejected(affiliate: any, withdrawal: any, notas?: string): Promise<void> {
    if (!affiliate?.email) return;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Levantamento rejeitado</h2>
        <p>Ola ${affiliate?.nomeCompleto || ""},</p>
        <p>O seu pedido de levantamento no valor de <strong>${this.formatValor(withdrawal?.valor)}</strong> foi rejeitado.</p>
        <p><strong>Motivo:</strong> ${notas || "Nenhuma justificativa fornecida."}</p>
        <p>O valor foi devolvido ao seu saldo disponivel.</p>
      </div>
    `;

    await this.send({ to: affiliate.email, subject: "Levantamento rejeitado", html });
  }
}

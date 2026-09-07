import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { MindgestEmailLayout } from "./templates/email-layout.builder";

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private transporterInitialized = false;

  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporterInitialized) return this.transporter;
    this.transporterInitialized = true;

    const host = process.env.SMTP_HOST || process.env.MAIL_SERVER;
    const user = process.env.SMTP_USER || process.env.MAIL_USERNAME;
    let pass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD || "";

    if (pass) {
      pass = pass.replace(/^["']|["']$/g, "").trim();
    }

    if (!host || !user || !pass) {
      this.logger.warn("SMTP/MAIL credentials not fully configured. Email sending is currently disabled.");
      return null;
    }

    const rawPort = process.env.SMTP_PORT || process.env.MAIL_PORT;
    const port = rawPort ? Number(rawPort) : 465;

    const secure =
      String(process.env.SMTP_SECURE).toLowerCase() === "true" ||
      port === 465 ||
      String(process.env.MAIL_SSL_TLS).toLowerCase() === "true";

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
    });

    this.transporter.verify((err) => {
      if (err) {
        this.logger.error(`SMTP Verification Failed (${host}:${port}): ${err.message}`);
      } else {
        this.logger.log(`SMTP connected & verified successfully (${host}:${port}, secure=${secure})`);
      }
    });

    return this.transporter;
  }

  private get defaultFrom(): string {
    const fromAddr = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || "geral@mindware.ao";
    return `"Mindgest Partners" <${fromAddr.replace(/^["']|["']$/g, "").trim()}>`;
  }

  async send(options: {
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
        this.logger.warn("Nenhum destinatário especificado para o email. Envio ignorado.");
        return;
      }

      await transporter.sendMail({
        from: this.defaultFrom,
        to: recipients,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email enviado com sucesso para [${recipients}] com o assunto "${options.subject}"`);
    } catch (error) {
      this.logger.error(`Falha ao enviar email: ${(error as Error)?.message}`, (error as Error)?.stack);
    }
  }

  /**
   * 1. Email de Boas-vindas pós-cadastro (Passos a seguir + vídeo)
   */
  async sendRegistrationWelcome(affiliate: { nomeCompleto?: string; email: string }): Promise<void> {
    if (!affiliate.email) return;
    const { subject, html } = MindgestEmailLayout.renderOnboardingWelcome(affiliate);
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 2. Email de Aprovação do cadastro
   */
  async sendAffiliateApproved(affiliate: { nomeCompleto: string; codigoAfiliado: string; email: string }): Promise<void> {
    if (!affiliate.email) return;
    const { subject, html } = MindgestEmailLayout.renderAffiliateApproved(affiliate);
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 3. Email de Recuperação de Palavra-passe
   */
  async sendPasswordReset(user: { email: string; nome?: string }, resetUrl: string): Promise<void> {
    if (!user.email) return;
    const { subject, html } = MindgestEmailLayout.renderPasswordReset({
      nomeCompleto: user.nome,
      resetUrl,
    });
    await this.send({ to: user.email, subject, html });
  }

  /**
   * 4. Email de Nova Comissão ou Comissão Aprovada
   */
  async sendCommissionEarned(
    affiliate: { nomeCompleto: string; email: string },
    commission: {
      valorComissao: any;
      clientNome: string;
      tipo?: string;
      statusAprovada?: boolean;
    },
  ): Promise<void> {
    if (!affiliate.email) return;
    const { subject, html } = MindgestEmailLayout.renderCommissionEarned({
      nomeCompleto: affiliate.nomeCompleto,
      valorComissao: commission.valorComissao,
      clientNome: commission.clientNome,
      tipo: commission.tipo,
      statusAprovada: commission.statusAprovada,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 5. Email de Reforço de Marketing / Poucos Clientes Ativos
   */
  async sendMarketingBoostReminder(affiliate: {
    nomeCompleto: string;
    email: string;
    activeClients?: number;
    codigoAfiliado?: string;
  }): Promise<void> {
    if (!affiliate.email) return;
    const { subject, html } = MindgestEmailLayout.renderMarketingBoostReminder(affiliate);
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 6. Notificação aos Administradores sobre Novo Levantamento
   */
  async sendWithdrawalRequestedToAdmins(affiliate: any, withdrawal: any): Promise<void> {
    const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS || "")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      this.logger.warn("ADMIN_NOTIFICATION_EMAILS não configurado. Email de pedido de levantamento ignorado.");
      return;
    }

    const { subject, html } = MindgestEmailLayout.renderWithdrawalRequestedAdmin({ affiliate, withdrawal });
    await this.send({ to: recipients, subject, html });
  }

  /**
   * 7. Confirmação de Levantamento Aprovado para o Afiliado
   */
  async sendWithdrawalApproved(affiliate: any, withdrawal: any, attachment?: MailAttachment): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderWithdrawalApproved({
      affiliate,
      withdrawal,
      hasAttachment: !!attachment,
    });

    await this.send({
      to: affiliate.email,
      subject,
      html,
      attachments: attachment ? [attachment] : undefined,
    });
  }

  /**
   * 8. Notificação de Levantamento Rejeitado para o Afiliado
   */
  async sendWithdrawalRejected(affiliate: any, withdrawal: any, notas?: string): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderWithdrawalRejected({ affiliate, withdrawal, notas });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 9. Subida de Nível de Parceiro (Milestone)
   */
  async sendPartnerLevelUp(
    affiliate: { nomeCompleto: string; email: string },
    data: { novoNivel: string; novoPercentual: number; proximaMeta?: string },
  ): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderPartnerLevelUp({
      nomeCompleto: affiliate.nomeCompleto,
      novoNivel: data.novoNivel,
      novoPercentual: data.novoPercentual,
      proximaMeta: data.proximaMeta,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 10. Proximidade de Meta ("Falta apenas 1 cliente")
   */
  async sendProximityAlert(
    affiliate: { nomeCompleto: string; email: string },
    data: { proximoNivel: string; percentualAlvo: number; clientesAtuais: number },
  ): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderProximityAlert({
      nomeCompleto: affiliate.nomeCompleto,
      proximoNivel: data.proximoNivel,
      percentualAlvo: data.percentualAlvo,
      clientesAtuais: data.clientesAtuais,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 11. Falha de Pagamento do Cliente (Prevenção Anti-Churn)
   */
  async sendClientPaymentFailedAlert(
    affiliate: { nomeCompleto: string; email: string },
    data: { clientName: string; planCode: string; amount: number },
  ): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderClientPaymentFailedAlert({
      nomeCompleto: affiliate.nomeCompleto,
      clientName: data.clientName,
      planCode: data.planCode,
      amount: data.amount,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 12. Limiar Mínimo de Levantamento Atingido (5.000 Kz)
   */
  async sendWithdrawalThresholdReached(
    affiliate: { nomeCompleto: string; email: string },
    saldoDisponivel: any,
  ): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderWithdrawalThresholdReached({
      nomeCompleto: affiliate.nomeCompleto,
      saldoDisponivel,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 13. Certificação Comercial Aprovada (Desbloqueio Plano PRO)
   */
  async sendCertificationApproved(
    affiliate: { nomeCompleto: string; email: string; codigoAfiliado: string },
  ): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderCertificationApproved({
      nomeCompleto: affiliate.nomeCompleto,
      codigoAfiliado: affiliate.codigoAfiliado,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * 14. Extrato Mensal de Rendimentos
   */
  async sendMonthlyStatement(
    affiliate: { nomeCompleto: string; email: string },
    data: { mesAno: string; clientesAtivos: number; totalGanhoMes: any; saldoDisponivel: any },
  ): Promise<void> {
    if (!affiliate?.email) return;
    const { subject, html } = MindgestEmailLayout.renderMonthlyStatement({
      nomeCompleto: affiliate.nomeCompleto,
      mesAno: data.mesAno,
      clientesAtivos: data.clientesAtivos,
      totalGanhoMes: data.totalGanhoMes,
      saldoDisponivel: data.saldoDisponivel,
    });
    await this.send({ to: affiliate.email, subject, html });
  }

  /**
   * Utilitário para testar a ligação SMTP
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const transporter = this.getTransporter();
    if (!transporter) {
      return { success: false, message: "Transportador SMTP não inicializado (credenciais em falta)." };
    }
    try {
      await transporter.verify();
      return { success: true, message: "Ligação SMTP estabelecida com sucesso com a Hostinger!" };
    } catch (error) {
      return { success: false, message: (error as Error)?.message || "Erro desconhecido ao testar SMTP" };
    }
  }
}

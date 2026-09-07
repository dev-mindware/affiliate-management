export interface EmailLayoutOptions {
  title?: string;
  preheader?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  badgeText?: string;
}

export class MindgestEmailLayout {
  /**
   * Formats a monetary value to Kz currency string.
   */
  static formatKz(valor: any): string {
    const num = Number(valor || 0);
    try {
      return `${new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)} Kz`;
    } catch {
      return `${num} Kz`;
    }
  }

  /**
   * Wraps the email content in the official Mindgest / Mindware layout.
   */
  static render(options: EmailLayoutOptions): string {
    const title = options.title || "Portal de Parceiros Mindware";
    const preheader = options.preheader || "";
    const content = options.contentHtml || "";
    const ctaText = options.ctaText;
    const ctaUrl = options.ctaUrl || "#";
    const badgeText = options.badgeText || "PROGRAMA DE PARCEIROS";
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const currentYear = new Date().getFullYear();

    const ctaHtml =
      ctaText && ctaUrl
        ? `
      <div style="text-align: center; margin: 30px 0 20px 0;">
        <a href="${ctaUrl}" target="_blank" style="background-color: #9956f6; color: #ffffff !important; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(153, 86, 246, 0.3); letter-spacing: 0.02em;">
          ${ctaText}
        </a>
      </div>
    `
        : "";

    return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f7fb;
      color: #374151;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
    }
    .wrapper {
      max-width: 600px;
      margin: 28px auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #eae6f5;
      box-shadow: 0 4px 20px -2px rgba(153, 86, 246, 0.08);
    }
    .header-bar {
      height: 4px;
      background: linear-gradient(90deg, #9956f6 0%, #7c3aed 100%);
    }
    .header {
      padding: 28px 24px 20px 24px;
      text-align: center;
      border-bottom: 1px solid #f0ecf9;
      background: #ffffff;
    }
    .brand-box {
      display: inline-block;
      text-align: center;
    }
    .brand-logo {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #18181b;
      letter-spacing: -0.5px;
      margin: 0;
      line-height: 1;
    }
    .brand-logo span {
      color: #9956f6;
    }
    .brand-badge {
      display: inline-block;
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      margin-top: 8px;
      letter-spacing: 0.08em;
      background-color: #f3eeff;
      color: #7c3aed;
    }
    .content-body {
      padding: 32px 28px;
      line-height: 1.7;
      font-size: 14px;
      color: #3f3f46;
    }
    .content-title {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #18181b;
      margin-top: 0;
      margin-bottom: 18px;
      text-align: center;
      letter-spacing: -0.2px;
    }
    .info-box {
      background-color: #fbfaff;
      border: 1px solid #ede8fc;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-title {
      font-size: 12px;
      font-weight: 700;
      color: #7c3aed;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 10px 0;
    }
    .info-list {
      padding-left: 18px;
      margin: 0;
    }
    .info-list li {
      margin-bottom: 8px;
      color: #52525b;
      font-size: 13px;
    }
    .youtube-box {
      background: linear-gradient(135deg, #faf8ff 0%, #f4edff 100%);
      border: 1px solid #ede8fc;
      border-radius: 10px;
      padding: 22px;
      margin: 24px 0;
      text-align: center;
    }
    .youtube-btn {
      display: inline-block;
      background-color: #ff0000;
      color: #ffffff !important;
      padding: 10px 22px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      margin-top: 10px;
      box-shadow: 0 2px 8px rgba(255, 0, 0, 0.25);
    }
    .alert-box {
      background-color: #fefce8;
      border-left: 3px solid #eab308;
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 13px;
      color: #713f12;
      line-height: 1.6;
    }
    .success-box {
      background-color: #f0fdf4;
      border-left: 3px solid #22c55e;
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 13px;
      color: #14532d;
      line-height: 1.6;
    }
    .highlight-card {
      background-color: #faf5ff;
      border: 1px dashed #d8b4fe;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 18px 0;
      text-align: center;
    }
    .whatsapp-badge {
      display: inline-block;
      background-color: #25D366;
      color: #ffffff !important;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      text-decoration: none;
      margin-top: 6px;
    }
    .footer {
      padding: 26px 20px;
      text-align: center;
      border-top: 1px solid #ede8fc;
      background-color: #fbfaff;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      color: #71717a;
    }
    .footer-logo-title {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #18181b;
      margin: 0;
    }
    .footer-links {
      margin: 12px 0;
    }
    .footer-links a {
      text-decoration: none;
      margin: 0 6px;
      font-weight: 500;
      font-size: 12px;
      color: #7c3aed;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    .footer-note {
      font-size: 11px;
      margin-top: 12px;
      line-height: 1.5;
      color: #a1a1aa;
    }
    @media only screen and (max-width: 520px) {
      .wrapper {
        margin: 8px auto !important;
        border-radius: 8px !important;
        width: 100% !important;
      }
      .content-body {
        padding: 22px 16px !important;
      }
      .header {
        padding: 22px 16px 16px 16px !important;
      }
      .footer {
        padding: 22px 16px !important;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  <div class="wrapper">
    <div class="header-bar"></div>
    <div class="header">
      <div class="brand-box">
        <h1 class="brand-logo">Mindgest <span>Partners</span></h1>
        <div class="brand-badge">${badgeText}</div>
      </div>
    </div>
    
    <div class="content-body">
      ${title ? `<h2 class="content-title">${title}</h2>` : ""}
      ${content}
      ${ctaHtml}
    </div>
    
    <div class="footer">
      <div style="margin-bottom: 6px;">
        <a href="${portalUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
          <div class="footer-logo-title">Mindgest Partners</div>
        </a>
        <div style="font-size: 11px; color: #71717a; margin-top: 2px;">Programa Oficial de Parceiros e Afiliados Mindware</div>
      </div>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #71717a;">Mindware - Comércio e Serviços, Lda</p>

      <div class="footer-links">
        <a href="https://mindware.ao" target="_blank">Website Oficial</a> &bull;
        <a href="${portalUrl}" target="_blank">Portal de Parceiros</a> &bull;
        <a href="mailto:geral@mindware.ao">geral@mindware.ao</a> &bull;
        <a href="https://wa.me/244943100922" target="_blank">WhatsApp: 943 100 922</a>
      </div>
      
      <div class="footer-note">
        Esta é uma mensagem automática do Portal de Parceiros Mindgest.<br>
        &copy; ${currentYear} Mindware. Todos os direitos reservados.
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  // =========================================================================
  // MODELO 1: Boas-vindas pós-cadastro (Texto oficial exato fornecido)
  // =========================================================================
  static renderOnboardingWelcome(affiliate: { nomeCompleto?: string; email?: string }): { subject: string; html: string } {
    const nome = affiliate.nomeCompleto || "Parceiro";
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">
        Saudações cordiais, <strong>${nome}</strong>.
      </p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Verificámos o seu registo no <strong>Portal de Parceiros da Mindware</strong> e agradecemos o interesse em fazer parte do nosso programa.
      </p>

      <div class="youtube-box">
        <p style="margin: 0 0 6px 0; font-weight: 700; color: #18181b; font-size: 15px;">
          Como Funciona o Programa de Parceiros?
        </p>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
          Para conhecer melhor o funcionamento do programa, recomendamos que assista ao vídeo explicativo no YouTube:
        </p>
        <a href="https://youtu.be/7vC-tyr3uS0" target="_blank" class="youtube-btn">
          ▶ Assistir ao Vídeo Explicativo
        </a>
      </div>

      <div class="info-box">
        <div class="info-title">Após assistir ao vídeo, solicitamos que siga estes passos:</div>
        <ol class="info-list" style="padding-left: 20px;">
          <li><strong>Subscreva</strong> o nosso canal do YouTube;</li>
          <li><strong>Envie</strong> para <a href="mailto:geral@mindware.ao" style="color: #7c3aed; font-weight: 600; text-decoration: none;">geral@mindware.ao</a> uma breve apresentação sobre a sua experiência ou capacidade de divulgação e vendas;</li>
          <li><strong>Após a aprovação</strong>, entre em contacto com a nossa equipa para receber os materiais necessários para a divulgação do Mindgest.</li>
        </ol>
      </div>

      <div class="highlight-card">
        <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Portal de Parceiros:</span><br>
        <a href="${portalUrl}" target="_blank" style="font-size: 15px; font-weight: 700; color: #7c3aed; text-decoration: none;">
          ${portalUrl}
        </a>
      </div>

      <div style="background-color: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #14532d; line-height: 1.6;">
        Para esclarecimentos ou acompanhamento, estamos disponíveis através do WhatsApp:<br>
        <a href="https://wa.me/244943100922" target="_blank" class="whatsapp-badge">
          💬 WhatsApp: 943 100 922
        </a>
      </div>

      <p style="margin: 22px 0 0 0; color: #52525b; font-size: 14px; line-height: 1.6;">
        Com os melhores cumprimentos,<br>
        <strong style="color: #18181b;">Equipa Mindware</strong>
      </p>
    `;

    return {
      subject: "Bem-vindo ao Portal de Parceiros Mindware — Próximos Passos",
      html: this.render({
        title: "Registo no Portal de Parceiros",
        preheader: "Conheça os próximos passos para começar a lucrar com o Programa de Parceiros da Mindware.",
        contentHtml,
        ctaText: "Aceder ao Portal de Parceiros",
        ctaUrl: portalUrl,
      }),
    };
  }

  // =========================================================================
  // MODELO 2: Aprovação do cadastro de parceiro
  // =========================================================================
  static renderAffiliateApproved(affiliate: { nomeCompleto: string; codigoAfiliado: string; email: string }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";

    const contentHtml = `
      <div class="success-box">
        <strong>Excelente notícia!</strong> A sua candidatura ao Programa de Parceiros Mindware foi analisada e <strong>aprovada com sucesso</strong>.
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${affiliate.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        A partir de agora já pode aceder a todas as funcionalidades do Portal de Parceiros, partilhar o seu link exclusivo, recomendar novos clientes e começar a acumular comissões recorrentes.
      </p>

      <div class="highlight-card">
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">O Seu Código de Parceiro Oficial</div>
        <div style="font-size: 22px; font-weight: 800; color: #7c3aed; letter-spacing: 1px;">${affiliate.codigoAfiliado}</div>
        <div style="font-size: 12px; color: #71717a; margin-top: 6px;">Utilize este código para identificar as suas indicações.</div>
      </div>

      <div class="info-box">
        <div class="info-title">Como começar a faturar com o Mindgest:</div>
        <ul class="info-list">
          <li><strong>Aceda à plataforma</strong> com o seu email (<code>${affiliate.email}</code>) e a sua palavra-passe.</li>
          <li><strong>Copie o seu link de parceiro</strong> no painel principal e partilhe com empresas, lojas, restaurantes e prestadores de serviços.</li>
          <li><strong>Indique novos clientes para o Mindgest</strong>: Sempre que um cliente subscrever um plano do Mindgest (Base, Smart ou Pro) com a sua referência, a sua comissão é creditada automaticamente.</li>
          <li><strong>Acompanhe em tempo real</strong> as subscrições ativas e as comissões recorrentes na carteira, com levantamentos disponíveis a partir de 5.000 Kz.</li>
        </ul>
      </div>

      <p style="margin: 18px 0 0 0; color: #52525b; font-size: 13px;">
        Precisa de materiais promocionais (flyers, posts para redes sociais ou apresentações)? Fale connosco pelo WhatsApp: <a href="https://wa.me/244943100922" style="color: #7c3aed; font-weight: 600;">943 100 922</a>.
      </p>
    `;

    return {
      subject: "A sua conta no Portal de Parceiros Mindware foi Aprovada! 🎉",
      html: this.render({
        title: "Conta de Parceiro Aprovada!",
        badgeText: "CONTA ATIVA",
        preheader: `Parabéns ${affiliate.nomeCompleto}! O seu registo foi aprovado. Comece já a partilhar o seu código.`,
        contentHtml,
        ctaText: "Aceder ao Meu Painel",
        ctaUrl: `${portalUrl}/auth/login`,
      }),
    };
  }

  // =========================================================================
  // MODELO 3: Recuperação de Palavra-passe
  // =========================================================================
  static renderPasswordReset(data: { nomeCompleto?: string; resetUrl: string }): { subject: string; html: string } {
    const nome = data.nomeCompleto || "Utilizador";

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${nome}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Recebemos um pedido para redefinir a palavra-passe associada à sua conta no <strong>Portal de Parceiros Mindware</strong>.
      </p>

      <p style="margin: 0 0 20px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Para definir uma nova palavra-passe com segurança, clique no botão abaixo:
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${data.resetUrl}" target="_blank" style="background-color: #9956f6; color: #ffffff !important; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(153, 86, 246, 0.3);">
          Redefinir Palavra-passe
        </a>
      </div>

      <div class="alert-box">
        <strong>Importante:</strong> Este link é válido por <strong>1 hora</strong>. Caso não tenha solicitado esta redefinição, por favor ignore este email ou entre em contacto com a nossa equipa caso suspeite de alguma atividade indevida.
      </div>

      <p style="font-size: 12px; color: #71717a; margin-top: 16px; word-break: break-all;">
        Se o botão não funcionar, copie e cole o seguinte link no seu navegador:<br>
        <a href="${data.resetUrl}" style="color: #7c3aed;">${data.resetUrl}</a>
      </p>
    `;

    return {
      subject: "Recuperação de Palavra-passe — Portal de Parceiros Mindware",
      html: this.render({
        title: "Recuperação de Palavra-passe",
        badgeText: "SEGURANÇA",
        preheader: "Redefina a sua palavra-passe de acesso ao Portal de Parceiros Mindware.",
        contentHtml,
      }),
    };
  }

  // =========================================================================
  // MODELO 4: Nova Comissão / Comissão Aprovada
  // =========================================================================
  static renderCommissionEarned(data: {
    nomeCompleto: string;
    valorComissao: any;
    clientNome: string;
    tipo?: string;
    statusAprovada?: boolean;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const valorFormatado = this.formatKz(data.valorComissao);
    const isAprovada = data.statusAprovada !== false;

    const contentHtml = `
      <div class="success-box">
        💰 <strong>${isAprovada ? "Comissão Disponível para Levantamento!" : "Nova Comissão Gerada!"}</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Temos uma excelente notícia sobre a sua atividade no programa:
      </p>

      <div class="highlight-card" style="background-color: #f0fdf4; border-color: #86efac;">
        <div style="font-size: 12px; font-weight: 600; color: #15803d; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
          Valor da Comissão
        </div>
        <div style="font-size: 26px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px;">
          ${valorFormatado}
        </div>
        <div style="font-size: 13px; color: #374151; margin-top: 6px;">
          Cliente: <strong>${data.clientNome}</strong> ${data.tipo ? `&bull; Origem: ${data.tipo}` : ""}
        </div>
      </div>

      <div class="info-box">
        <div class="info-title">Estado da Carteira:</div>
        <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
          ${isAprovada
            ? `O valor de <strong>${valorFormatado}</strong> já foi adicionado ao seu saldo disponível na carteira. Pode solicitar o levantamento bancário a qualquer momento a partir de 5.000 Kz.`
            : `A comissão está em análise e, assim que for validada, ficará disponível para levantamento na sua carteira.`}
        </p>
      </div>
    `;

    return {
      subject: `Nova Comissão de ${valorFormatado} no Portal de Parceiros! 💰`,
      html: this.render({
        title: isAprovada ? "Comissão Aprovada!" : "Nova Comissão Registada!",
        badgeText: "COMISSÃO",
        preheader: `Parabéns! Recebeu uma comissão de ${valorFormatado} referente ao cliente ${data.clientNome}.`,
        contentHtml,
        ctaText: "Ver Minha Carteira",
        ctaUrl: `${portalUrl}/affiliate/wallet`,
      }),
    };
  }

  // =========================================================================
  // MODELO 5: Reforço de Marketing / Poucos Clientes Ativos (Novo pedido do user)
  // =========================================================================
  static renderMarketingBoostReminder(affiliate: {
    nomeCompleto: string;
    activeClients?: number;
    codigoAfiliado?: string;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const clientes = affiliate.activeClients ?? 0;

    const contentHtml = `
      <div class="alert-box">
        🚀 <strong>Dica Estratégica:</strong> Aumente as suas comissões recorrentes no Programa de Parceiros.
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${affiliate.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Notámos que a sua conta está com <strong>${clientes} cliente${clientes === 1 ? "" : "s"} ativo${clientes === 1 ? "" : "s"}</strong> no momento.
      </p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Sugerimos que <strong>reforce as suas ações de marketing e divulgação</strong> para acelerar os seus ganhos. No Mindgest Partners, quanto mais clientes mantiver ativos, maior é a sua percentagem de comissão recorrente todos os meses:
      </p>

      <div class="info-box">
        <div class="info-title">Escalada de Níveis e Comissões Recorrentes:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;">
          <tr style="border-bottom: 1px solid #ede8fc;">
            <td style="padding: 6px 0; color: #374151;"><strong>Base</strong> (&lt; 15 clientes)</td>
            <td style="text-align: right; font-weight: 700; color: #7c3aed;">15% Recorrente</td>
          </tr>
          <tr style="border-bottom: 1px solid #ede8fc;">
            <td style="padding: 6px 0; color: #374151;"><strong>Prata (Silver)</strong> (15-39 clientes)</td>
            <td style="text-align: right; font-weight: 700; color: #7c3aed;">20% Recorrente (+5% bónus)</td>
          </tr>
          <tr style="border-bottom: 1px solid #ede8fc;">
            <td style="padding: 6px 0; color: #374151;"><strong>Ouro (Gold)</strong> (40-99 clientes)</td>
            <td style="text-align: right; font-weight: 700; color: #7c3aed;">27% Recorrente (+12% bónus)</td>
          </tr>
          <tr style="border-bottom: 1px solid #ede8fc;">
            <td style="padding: 6px 0; color: #374151;"><strong>Platina (Platinum)</strong> (100-249 clientes)</td>
            <td style="text-align: right; font-weight: 700; color: #7c3aed;">33% Recorrente (+18% bónus)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #374151;"><strong>Elite</strong> (&ge; 250 clientes)</td>
            <td style="text-align: right; font-weight: 700; color: #7c3aed;">38% Recorrente (+23% bónus)</td>
          </tr>
        </table>
      </div>

      <div class="info-box" style="background-color: #f8fafc; border-color: #e2e8f0;">
        <div class="info-title" style="color: #475569;">Sugestões Práticas de Divulgação do Mindgest:</div>
        <ul class="info-list">
          <li><strong>Status e Redes Sociais:</strong> Publique vídeos demonstrando como o Mindgest emite faturas certificadas pela AGT em segundos.</li>
          <li><strong>Abordagem Direta:</strong> Fale com empresas, comércios e prestadores de serviços da sua rede que precisem de um software de faturação e gestão moderno.</li>
          <li><strong>Partilha do Link de Parceiro:</strong> Garanta que os seus clientes se registam no Mindgest através do seu link exclusivo para que as assinaturas e renovações fiquem associadas à sua conta.</li>
        </ul>
      </div>

      <p style="margin: 18px 0 0 0; color: #52525b; font-size: 13px;">
        Quer receber materiais de marketing personalizados ou tirar dúvidas sobre vendas? Entre em contacto connosco pelo WhatsApp: <a href="https://wa.me/244943100922" style="color: #7c3aed; font-weight: 600;">943 100 922</a>.
      </p>
    `;

    return {
      subject: "Aumente as suas comissões: Dicas e reforço de divulgação para o seu perfil 📈",
      html: this.render({
        title: "Acelere os seus Ganhos como Parceiro",
        badgeText: "CRESCIMENTO",
        preheader: "Está com poucos clientes ativos? Conheça dicas práticas para reforçar a divulgação e alcançar até 38% de comissão.",
        contentHtml,
        ctaText: "Aceder aos Materiais e Portal",
        ctaUrl: `${portalUrl}/affiliate/dashboard`,
      }),
    };
  }

  // =========================================================================
  // MODELO 6: Novo Pedido de Levantamento (Para Administradores)
  // =========================================================================
  static renderWithdrawalRequestedAdmin(data: { affiliate: any; withdrawal: any }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const valorFormatado = this.formatKz(data.withdrawal?.valor);

    const contentHtml = `
      <div class="alert-box" style="background-color: #f0f9ff; border-left-color: #0284c7; color: #075985;">
        🔔 <strong>Novo Pedido de Levantamento Submetido</strong> que aguarda análise e processamento.
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #ede8fc;">
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Afiliado:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 700;">${data.affiliate?.nomeCompleto || "-"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ede8fc;">
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
          <td style="padding: 8px 0; color: #18181b;">${data.affiliate?.email || "-"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ede8fc;">
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Valor do Saque:</td>
          <td style="padding: 8px 0; color: #16a34a; font-weight: 800; font-size: 16px;">${valorFormatado}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ede8fc;">
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Banco de Destino:</td>
          <td style="padding: 8px 0; color: #18181b;">${data.withdrawal?.banco || "-"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ede8fc;">
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Conta / IBAN:</td>
          <td style="padding: 8px 0; color: #18181b; font-family: monospace;">${data.withdrawal?.contaBancaria || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Data do Pedido:</td>
          <td style="padding: 8px 0; color: #18181b;">${new Date().toLocaleString("pt-AO")}</td>
        </tr>
      </table>
    `;

    return {
      subject: `[Admin] Novo Pedido de Levantamento: ${valorFormatado} - ${data.affiliate?.nomeCompleto || "Afiliado"}`,
      html: this.render({
        title: "Novo Pedido de Levantamento",
        badgeText: "ADMIN ALERTA",
        preheader: `Pedido de levantamento de ${valorFormatado} por ${data.affiliate?.nomeCompleto}.`,
        contentHtml,
        ctaText: "Gerir Levantamentos",
        ctaUrl: `${portalUrl}/admin/withdrawals`,
      }),
    };
  }

  // =========================================================================
  // MODELO 7: Levantamento Aprovado (Para o Afiliado)
  // =========================================================================
  static renderWithdrawalApproved(data: { affiliate: any; withdrawal: any; hasAttachment?: boolean }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const valorFormatado = this.formatKz(data.withdrawal?.valor);

    const contentHtml = `
      <div class="success-box">
        ✅ <strong>Transferência Processada!</strong> O seu levantamento foi aprovado com sucesso.
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.affiliate?.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Confirmamos que a transferência do seu levantamento no valor de <strong>${valorFormatado}</strong> foi efetuada para a sua conta bancária (${data.withdrawal?.banco || "Banco registado"}).
      </p>

      ${
        data.hasAttachment
          ? `<p style="margin: 0 0 16px 0; color: #15803d; font-weight: 600;">📎 O comprovativo bancário oficial segue em anexo a este email.</p>`
          : ""
      }

      <div class="highlight-card">
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Valor Transferido</div>
        <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 4px;">${valorFormatado}</div>
      </div>

      <p style="margin: 18px 0 0 0; color: #52525b; font-size: 13px;">
        Agradecemos a sua dedicação e parceria com a Mindware. Continue a divulgar e a faturar com o Mindgest!
      </p>
    `;

    return {
      subject: `Levantamento de ${valorFormatado} Aprovado com Sucesso! ✅`,
      html: this.render({
        title: "Levantamento Aprovado",
        badgeText: "PAGAMENTO EFETUADO",
        preheader: `O seu levantamento de ${valorFormatado} foi aprovado e processado.`,
        contentHtml,
        ctaText: "Aceder ao Meu Histórico",
        ctaUrl: `${portalUrl}/affiliate/wallet`,
      }),
    };
  }

  // =========================================================================
  // MODELO 8: Levantamento Rejeitado (Para o Afiliado)
  // =========================================================================
  static renderWithdrawalRejected(data: { affiliate: any; withdrawal: any; notas?: string }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const valorFormatado = this.formatKz(data.withdrawal?.valor);

    const contentHtml = `
      <div class="alert-box" style="background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;">
        ⚠️ <strong>Aviso sobre o Pedido de Levantamento</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.affiliate?.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Informamos que o seu pedido de levantamento no valor de <strong>${valorFormatado}</strong> não pôde ser aprovado neste momento.
      </p>

      <div class="info-box">
        <div class="info-title" style="color: #b91c1c;">Motivo indicado pela administração:</div>
        <p style="margin: 0; font-size: 13px; color: #4b5563; font-style: italic;">
          "${data.notas || "Dados bancários inconsistentes ou divergência na conta indicada. Por favor atualize o seu IBAN/Conta no perfil."}"
        </p>
      </div>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        O valor de <strong>${valorFormatado}</strong> foi integralmente devolvido ao seu saldo disponível na carteira.
      </p>

      <p style="margin: 18px 0 0 0; color: #52525b; font-size: 13px;">
        Pode rever os seus dados bancários no seu perfil e submeter um novo pedido a qualquer instante. Para apoio direto, contacte o WhatsApp: <a href="https://wa.me/244943100922" style="color: #7c3aed; font-weight: 600;">943 100 922</a>.
      </p>
    `;

    return {
      subject: `Atualização sobre o seu Pedido de Levantamento — ${valorFormatado}`,
      html: this.render({
        title: "Levantamento Não Aprovado",
        badgeText: "CARTEIRA ATUALIZADA",
        preheader: `O pedido de levantamento de ${valorFormatado} foi devolvido ao seu saldo disponível.`,
        contentHtml,
        ctaText: "Rever Dados e Carteira",
        ctaUrl: `${portalUrl}/affiliate/wallet`,
      }),
    };
  }

  // =========================================================================
  // MODELO 9: Subida de Nível de Parceiro (Milestone Gamification)
  // =========================================================================
  static renderPartnerLevelUp(data: {
    nomeCompleto: string;
    novoNivel: string;
    novoPercentual: number;
    proximaMeta?: string;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";

    const contentHtml = `
      <div class="success-box" style="background-color: #fdf4ff; border-left-color: #c026d3; color: #86198f;">
        🏆 <strong>PARABÉNS! SUBIU DE NÍVEL NO PROGRAMA DE PARCEIROS!</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        O seu esforço na divulgação e angariação de clientes para o <strong>Mindgest</strong> acaba de ser recompensado! Acabou de alcançar o nível oficial:
      </p>

      <div class="highlight-card" style="background-color: #fdf4ff; border-color: #e879f9; padding: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #a21caf; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Novo Nível Alcançado</div>
        <div style="font-size: 26px; font-weight: 800; color: #9333ea; letter-spacing: -0.5px;">Nível ${data.novoNivel}</div>
        <div style="font-size: 14px; font-weight: 700; color: #16a34a; margin-top: 6px;">
          Nova Comissão Recorrente: ${data.novoPercentual}% todos os meses!
        </div>
      </div>

      <div class="info-box">
        <div class="info-title">O que isto significa para os seus ganhos:</div>
        <ul class="info-list">
          <li><strong>Maior Rentabilidade:</strong> Todas as renovações mensais e anuidades pagas pelos seus clientes no Mindgest passam a render ${data.novoPercentual}% para a sua carteira.</li>
          <li><strong>Rendimento Passivo Crescente:</strong> Quanto mais a sua carteira de clientes se mantiver ativa no software, maior será o seu montante recebido.</li>
          ${data.proximaMeta ? `<li><strong>Próximo Desafio:</strong> ${data.proximaMeta}.</li>` : ""}
        </ul>
      </div>

      <p style="margin: 18px 0 0 0; color: #52525b; font-size: 13px;">
        A equipa Mindware orgulha-se da sua parceria. Continue a divulgar e conte sempre com o nosso suporte através do WhatsApp: <a href="https://wa.me/244943100922" style="color: #7c3aed; font-weight: 600;">943 100 922</a>.
      </p>
    `;

    return {
      subject: `Parabéns! Subiu para o Nível ${data.novoNivel} no Mindgest Partners! 🏆`,
      html: this.render({
        title: `Novo Nível: ${data.novoNivel}!`,
        badgeText: "SUBIDA DE NÍVEL",
        preheader: `Parabéns ${data.nomeCompleto}! Atingiu o Nível ${data.novoNivel} e agora ganha ${data.novoPercentual}% de comissão recorrente.`,
        contentHtml,
        ctaText: "Ver Meu Painel e Nível",
        ctaUrl: `${portalUrl}/affiliate/dashboard`,
      }),
    };
  }

  // =========================================================================
  // MODELO 10: Alerta de Proximidade de Meta ("Falta Apenas 1 Cliente")
  // =========================================================================
  static renderProximityAlert(data: {
    nomeCompleto: string;
    proximoNivel: string;
    percentualAlvo: number;
    clientesAtuais: number;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";

    const contentHtml = `
      <div class="alert-box" style="background-color: #fff7ed; border-left-color: #f97316; color: #9a3412;">
        🔥 <strong>ESTÁ A APENAS 1 CLIENTE DE SUBIR DE NÍVEL!</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Fizemos uma verificação na sua conta e temos uma novidade motivadora: com <strong>${data.clientesAtuais} clientes ativos</strong>, falta-lhe exatamente <strong>1 único cliente</strong> para desbloquear o:
      </p>

      <div class="highlight-card" style="background-color: #fff7ed; border-color: #fdba74;">
        <div style="font-size: 12px; font-weight: 700; color: #c2410c; text-transform: uppercase;">Meta Imediata</div>
        <div style="font-size: 24px; font-weight: 800; color: #ea580c; margin-top: 4px;">Nível ${data.proximoNivel} (${data.percentualAlvo}% Recorrente)</div>
      </div>

      <div class="info-box">
        <div class="info-title">Como garantir este cliente ainda hoje:</div>
        <ul class="info-list">
          <li>Fale com um comerciante ou empresa amiga que ainda emita faturas manualmente ou num software antigo.</li>
          <li>Apresente a facilidade do Mindgest certificado pela AGT com emissão em segundos no telemóvel ou PC.</li>
          <li>Partilhe o seu link exclusivo de parceiro para que a subscrição feche sob a sua referência.</li>
        </ul>
      </div>
    `;

    return {
      subject: `Falta apenas 1 cliente para subir para o Nível ${data.proximoNivel}! 🔥`,
      html: this.render({
        title: "Está Quase Lá!",
        badgeText: "META PRÓXIMA",
        preheader: `Falta apenas 1 cliente para alcançar o Nível ${data.proximoNivel} e aumentar a sua comissão para ${data.percentualAlvo}%.`,
        contentHtml,
        ctaText: "Aceder ao Link de Parceiro",
        ctaUrl: `${portalUrl}/affiliate/dashboard`,
      }),
    };
  }

  // =========================================================================
  // MODELO 11: Falha de Pagamento do Cliente (Prevenção Anti-Churn)
  // =========================================================================
  static renderClientPaymentFailedAlert(data: {
    nomeCompleto: string;
    clientName: string;
    planCode: string;
    amount: number;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const valorFormatado = this.formatKz(data.amount);

    const contentHtml = `
      <div class="alert-box" style="background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;">
        ⚠️ <strong>Atenção: Subscrição com Pagamento Pendente</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Identificámos que a renovação da assinatura do seu cliente no software Mindgest está pendente:
      </p>

      <div class="highlight-card" style="background-color: #fef2f2; border-color: #fca5a5; text-align: left;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #7f1d1d; font-weight: 600;">Cliente:</td>
            <td style="padding: 4px 0; color: #18181b; font-weight: 700;">${data.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #7f1d1d; font-weight: 600;">Plano:</td>
            <td style="padding: 4px 0; color: #18181b;">Mindgest ${data.planCode}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #7f1d1d; font-weight: 600;">Valor da Fatura:</td>
            <td style="padding: 4px 0; color: #18181b; font-weight: 700;">${valorFormatado}</td>
          </tr>
        </table>
      </div>

      <div class="info-box">
        <div class="info-title">Como proteger a sua comissão recorrente:</div>
        <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
          Para garantir que a sua comissão mensal não seja interrompida, sugerimos que faça um contacto de cortesia com o cliente para lembrá-lo da regularização da licença ou oferecer ajuda caso tenha dúvidas sobre o pagamento.
        </p>
      </div>
    `;

    return {
      subject: `Atenção: A subscrição do seu cliente ${data.clientName} está com pagamento pendente ⚠️`,
      html: this.render({
        title: "Subscrição Pendente de Pagamento",
        badgeText: "AVISO RECORRENTE",
        preheader: `A mensalidade do cliente ${data.clientName} está pendente. Contacte o cliente para assegurar a sua comissão.`,
        contentHtml,
        ctaText: "Ver Meus Clientes",
        ctaUrl: `${portalUrl}/affiliate/my-clients`,
      }),
    };
  }

  // =========================================================================
  // MODELO 12: Limiar Mínimo de Levantamento Atingido (5.000 Kz)
  // =========================================================================
  static renderWithdrawalThresholdReached(data: {
    nomeCompleto: string;
    saldoDisponivel: any;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const saldoFormatado = this.formatKz(data.saldoDisponivel);

    const contentHtml = `
      <div class="success-box">
        💳 <strong>Atingiu o Valor Mínimo de Levantamento!</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        O saldo disponível da sua carteira no Portal de Parceiros ultrapassou o montante mínimo permitido para transferência bancária (5.000 Kz):
      </p>

      <div class="highlight-card" style="background-color: #f0fdf4; border-color: #86efac;">
        <div style="font-size: 12px; font-weight: 600; color: #15803d; text-transform: uppercase;">Saldo Pronto para Saque</div>
        <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin-top: 4px;">${saldoFormatado}</div>
      </div>

      <div class="info-box">
        <div class="info-title">Como solicitar o levantamento:</div>
        <ul class="info-list">
          <li>Aceda ao menu <strong>Carteira</strong> no seu portal.</li>
          <li>Clique no botão <strong>Solicitar Levantamento</strong>.</li>
          <li>Confirme os seus dados bancários (Banco e IBAN) e submeta o pedido. A nossa equipa financeira processará o pagamento com a máxima rapidez.</li>
        </ul>
      </div>
    `;

    return {
      subject: `Atingiu o valor mínimo de levantamento (${saldoFormatado})! Já pode solicitar o seu saque 💳`,
      html: this.render({
        title: "Saldo Disponível para Saque!",
        badgeText: "CARTEIRA PRONTA",
        preheader: `O seu saldo disponível atingiu ${saldoFormatado}. Solicite o seu levantamento bancário agora.`,
        contentHtml,
        ctaText: "Solicitar Levantamento",
        ctaUrl: `${portalUrl}/affiliate/wallet`,
      }),
    };
  }

  // =========================================================================
  // MODELO 13: Certificação Comercial Aprovada (Desbloqueio Plano PRO)
  // =========================================================================
  static renderCertificationApproved(data: {
    nomeCompleto: string;
    codigoAfiliado: string;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";

    const contentHtml = `
      <div class="success-box" style="background-color: #eff6ff; border-left-color: #3b82f6; color: #1e40af;">
        🏅 <strong>CERTIFICAÇÃO COMERCIAL MINDGEST APROVADA!</strong>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Parabéns, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        A sua avaliação e competência comercial foram validadas com sucesso. É agora oficialmente um <strong>Parceiro Comercial Certificado Mindgest</strong>.
      </p>

      <div class="highlight-card" style="background-color: #eff6ff; border-color: #93c5fd;">
        <div style="font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">Estatuto Especial</div>
        <div style="font-size: 20px; font-weight: 800; color: #1e40af; margin-top: 4px;">Plano PRO Mindgest Desbloqueado 🚀</div>
        <div style="font-size: 12px; color: #3b82f6; margin-top: 4px;">Permissão para negociar orçamentos e vendas corporativas</div>
      </div>

      <div class="info-box">
        <div class="info-title">Novos privilégios do seu perfil:</div>
        <ul class="info-list">
          <li><strong>Venda do Plano PRO:</strong> Acesso à comercialização do plano mais avançado do Mindgest para grandes empresas.</li>
          <li><strong>Preços Customizados:</strong> Capacidade de propor cotações sob medida com margens superiores.</li>
          <li><strong>Selo de Parceiro Certificado:</strong> Reconhecimento institucional Mindware nas suas abordagens comerciais.</li>
        </ul>
      </div>
    `;

    return {
      subject: "Parabéns! É agora um Parceiro Comercial Certificado Mindgest 🏅",
      html: this.render({
        title: "Parceiro Certificado Mindgest",
        badgeText: "CERTIFICAÇÃO PRO",
        preheader: `Parabéns ${data.nomeCompleto}! O seu estatuto de Parceiro Comercial Certificado foi aprovado.`,
        contentHtml,
        ctaText: "Aceder às Funcionalidades PRO",
        ctaUrl: `${portalUrl}/affiliate/dashboard`,
      }),
    };
  }

  // =========================================================================
  // MODELO 14: Extrato Mensal de Rendimentos (Resumo Periódico)
  // =========================================================================
  static renderMonthlyStatement(data: {
    nomeCompleto: string;
    mesAno: string;
    clientesAtivos: number;
    totalGanhoMes: any;
    saldoDisponivel: any;
  }): { subject: string; html: string } {
    const portalUrl = process.env.APP_AFFILIATE_URL || "https://parceiros.mindware.ao";
    const ganhoFormatado = this.formatKz(data.totalGanhoMes);
    const saldoFormatado = this.formatKz(data.saldoDisponivel);

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #18181b;">Olá, <strong>${data.nomeCompleto}</strong>,</p>

      <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 14px; line-height: 1.7;">
        Apresentamos o resumo do seu desempenho e rendimentos como parceiro do Mindgest referente a <strong>${data.mesAno}</strong>:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="background-color: #fbfaff; border: 1px solid #ede8fc;">
          <td style="padding: 12px; color: #6b7280; font-weight: 600;">Clientes Ativos Faturando:</td>
          <td style="padding: 12px; text-align: right; color: #18181b; font-weight: 800; font-size: 15px;">${data.clientesAtivos}</td>
        </tr>
        <tr style="border: 1px solid #ede8fc;">
          <td style="padding: 12px; color: #6b7280; font-weight: 600;">Comissões Ganhas no Mês:</td>
          <td style="padding: 12px; text-align: right; color: #16a34a; font-weight: 800; font-size: 16px;">${ganhoFormatado}</td>
        </tr>
        <tr style="background-color: #fbfaff; border: 1px solid #ede8fc;">
          <td style="padding: 12px; color: #6b7280; font-weight: 600;">Saldo Atual Disponível:</td>
          <td style="padding: 12px; text-align: right; color: #7c3aed; font-weight: 800; font-size: 16px;">${saldoFormatado}</td>
        </tr>
      </table>

      <div class="info-box">
        <div class="info-title">Meta para o novo mês:</div>
        <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
          Recomende o Mindgest a mais 2 empresas este mês para aumentar o seu bolo de comissões recorrentes. As renovações mensais dos seus clientes continuam a gerar receita automática na sua carteira!
        </p>
      </div>
    `;

    return {
      subject: `O seu Extrato de Rendimentos Mindgest Partners — ${data.mesAno} 📊`,
      html: this.render({
        title: `Extrato Mensal: ${data.mesAno}`,
        badgeText: "EXTRATO MENSAL",
        preheader: `Confira o seu resumo de rendimentos de ${data.mesAno}: ${ganhoFormatado} em comissões geradas.`,
        contentHtml,
        ctaText: "Aceder à Minha Carteira",
        ctaUrl: `${portalUrl}/affiliate/wallet`,
      }),
    };
  }
}

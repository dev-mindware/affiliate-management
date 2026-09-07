import { MindgestEmailLayout } from "./templates/email-layout.builder";

describe("MindgestEmailLayout & Email Templates", () => {
  describe("Model 1: Onboarding Welcome Email", () => {
    it("renders the exact requested onboarding copy, video URL, email and WhatsApp", () => {
      const email = MindgestEmailLayout.renderOnboardingWelcome({
        nomeCompleto: "Jonatão Cardoso",
        email: "jonatao@mindware.ao",
      });

      expect(email.subject).toContain("Bem-vindo ao Portal de Parceiros Mindware");
      expect(email.html).toContain("https://youtu.be/7vC-tyr3uS0");
      expect(email.html).toContain("Subscreva");
      expect(email.html).toContain("canal do YouTube");
      expect(email.html).toContain("geral@mindware.ao");
      expect(email.html).toContain("943 100 922");
    });
  });

  describe("Model 2: Affiliate Approved Email", () => {
    it("renders approved affiliate details and 5.000 Kz withdrawal threshold", () => {
      const email = MindgestEmailLayout.renderAffiliateApproved({
        nomeCompleto: "Jonatão Cardoso",
        codigoAfiliado: "MWD-AO-1234",
        email: "jonatao@mindware.ao",
      });

      expect(email.subject).toContain("Aprovada");
      expect(email.html).toContain("MWD-AO-1234");
      expect(email.html).toContain("5.000 Kz");
      expect(email.html).not.toContain("8.000 Kz");
    });
  });

  describe("Model 3: Password Reset Email", () => {
    it("renders reset password link", () => {
      const email = MindgestEmailLayout.renderPasswordReset({
        nomeCompleto: "Jonatão Cardoso",
        resetUrl: "https://parceiros.mindware.ao/auth/reset-password?token=abc",
      });

      expect(email.subject).toContain("Recuperação de Palavra-passe");
      expect(email.html).toContain("https://parceiros.mindware.ao/auth/reset-password?token=abc");
    });
  });

  describe("Model 4: Commission Earned Email", () => {
    it("renders commission details and 5.000 Kz minimum threshold", () => {
      const email = MindgestEmailLayout.renderCommissionEarned({
        nomeCompleto: "Jonatão Cardoso",
        valorComissao: 25000,
        clientNome: "Empresa ABC",
        tipo: "Assinatura Mindgest (BASE)",
        statusAprovada: true,
      });

      expect(email.subject).toMatch(/25[.\s\u00a0]000,00 Kz/);
      expect(email.html).toMatch(/25[.\s\u00a0]000,00 Kz/);
      expect(email.html).toContain("Empresa ABC");
      expect(email.html).toContain("5.000 Kz");
      expect(email.html).not.toContain("8.000 Kz");
    });
  });

  describe("Model 5: Marketing Boost Reminder Email", () => {
    it("renders marketing boost advice and levels from 15% to 38%", () => {
      const email = MindgestEmailLayout.renderMarketingBoostReminder({
        nomeCompleto: "Jonatão Cardoso",
        activeClients: 2,
        codigoAfiliado: "MWD-AO-1234",
      });

      expect(email.subject).toContain("Aumente as suas comissões");
      expect(email.html).toContain("15% Recorrente");
      expect(email.html).toContain("20% Recorrente");
      expect(email.html).toContain("27% Recorrente");
      expect(email.html).toContain("33% Recorrente");
      expect(email.html).toContain("38% Recorrente");
    });
  });

  describe("Model 12: Withdrawal Minimum Threshold Reached Email", () => {
    it("renders withdrawal threshold reached email with exactly 5.000 Kz minimum", () => {
      const email = MindgestEmailLayout.renderWithdrawalThresholdReached({
        nomeCompleto: "Jonatão Cardoso",
        saldoDisponivel: 12500,
      });

      expect(email.subject).toMatch(/12[.\s\u00a0]500,00 Kz/);
      expect(email.html).toContain("5.000 Kz");
      expect(email.html).not.toContain("8.000 Kz");
    });
  });

  describe("All 14 Email Models Execution", () => {
    it("successfully renders all 14 models without exceptions", () => {
      const models = [
        MindgestEmailLayout.renderOnboardingWelcome({ nomeCompleto: "A", email: "a@mindware.ao" }),
        MindgestEmailLayout.renderAffiliateApproved({ nomeCompleto: "A", codigoAfiliado: "MWD-AO-1234", email: "a@mindware.ao" }),
        MindgestEmailLayout.renderPasswordReset({ nomeCompleto: "A", resetUrl: "http://test" }),
        MindgestEmailLayout.renderCommissionEarned({ nomeCompleto: "A", valorComissao: 1000, clientNome: "C" }),
        MindgestEmailLayout.renderMarketingBoostReminder({ nomeCompleto: "A", activeClients: 1 }),
        MindgestEmailLayout.renderWithdrawalRequestedAdmin({ affiliate: { nomeCompleto: "A", email: "a@mindware.ao" }, withdrawal: { valor: 5000, banco: "BAI", contaBancaria: "123" } }),
        MindgestEmailLayout.renderWithdrawalApproved({ affiliate: { nomeCompleto: "A", email: "a@mindware.ao" }, withdrawal: { valor: 5000, banco: "BAI" } }),
        MindgestEmailLayout.renderWithdrawalRejected({ affiliate: { nomeCompleto: "A", email: "a@mindware.ao" }, withdrawal: { valor: 5000 }, notas: "IBAN invalido" }),
        MindgestEmailLayout.renderPartnerLevelUp({ nomeCompleto: "A", novoNivel: "SILVER", novoPercentual: 5 }),
        MindgestEmailLayout.renderProximityAlert({ nomeCompleto: "A", proximoNivel: "GOLD", percentualAlvo: 27, clientesAtuais: 39 }),
        MindgestEmailLayout.renderClientPaymentFailedAlert({ nomeCompleto: "A", clientName: "Client X", planCode: "SMART", amount: 11998 }),
        MindgestEmailLayout.renderWithdrawalThresholdReached({ nomeCompleto: "A", saldoDisponivel: 5000 }),
        MindgestEmailLayout.renderCertificationApproved({ nomeCompleto: "A", codigoAfiliado: "MWD-AO-1234" }),
        MindgestEmailLayout.renderMonthlyStatement({ nomeCompleto: "A", mesAno: "Setembro 2026", clientesAtivos: 10, totalGanhoMes: 50000, saldoDisponivel: 30000 }),
      ];

      expect(models).toHaveLength(14);
      models.forEach((m) => {
        expect(m.subject).toBeTruthy();
        expect(m.html).toContain("Mindgest");
        expect(m.html).toContain("Outfit");
      });
    });
  });
});

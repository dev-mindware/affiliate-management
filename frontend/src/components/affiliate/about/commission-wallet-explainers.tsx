import { Card, CardContent, CardHeader, CardTitle, Icon } from "@workspace/ui";

const commissionPoints = [
  {
    dot: "bg-primary",
    label: "Primeiro pagamento (mensal ou anual):",
    text: "Ganha sempre 20% do valor pago pelo cliente no momento da adesão inicial.",
  },
  {
    dot: "bg-primary",
    label: "Renovações mensais e anuais:",
    text: "Ganha a percentagem recorrente do seu nível atual em cada renovação de subscrição.",
  },
  {
    dot: "bg-primary",
    label: "Upgrade automático de nível:",
    text: "Ao atingir a contagem de clientes necessária, o seu escalão e respetivo bónus são atualizados de imediato.",
  },
];

const walletPoints = [
  {
    dot: "bg-amber-500",
    label: "Saldo Pendente:",
    text: "As comissões ficam retidas por 15 dias após o pagamento do cliente (período de carência e garantia).",
  },
  {
    dot: "bg-emerald-500",
    label: "Saldo Disponível:",
    text: "Após os 15 dias, o valor transita automaticamente para disponível, pronto para transferência.",
  },
  {
    dot: "bg-primary",
    label: "Levantamento mínimo:",
    text: "O valor mínimo oficial para solicitar levantamento para o seu IBAN é de 5.000,00 Kz.",
  },
];

export function CommissionAndWalletExplainers() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Commissions */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Icon name="Coins" className="size-4.5 text-primary" />
            Como são calculadas as comissões?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          {commissionPoints.map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
              <span>
                <span className="font-semibold text-foreground">{item.label}</span>{" "}
                {item.text}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wallet */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Icon name="Wallet" className="size-4.5 text-primary" />
            Como funciona a Carteira?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          {walletPoints.map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
              <span>
                <span className="font-semibold text-foreground">{item.label}</span>{" "}
                {item.text}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

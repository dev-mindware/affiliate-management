import { Icon } from "@workspace/ui";

export function MarketingTipsCard() {
  return (
    <div
      data-tour="strategy-tips"
      className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs"
    >
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Icon name="Info" size={16} className="text-primary" />
        Recomendações para Maximizar as suas Comissões no Mindgest
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">1. Foco na Conformidade Fiscal AGT</p>
          <p>
            Muitos comerciantes ainda utilizam faturas manuais ou sistemas não homologados,
            arriscando multas pesadas. Enfatize a segurança jurídica do Mindgest.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">2. Demonstração Rápida no Telemóvel</p>
          <p>
            Mostre ao comerciante como é fácil emitir uma fatura em menos de 10 segundos
            usando apenas o telemóvel ou tablet. A agilidade visual fecha vendas.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">3. Acompanhe a Primeira Ativação</p>
          <p>
            Ajude o seu cliente no primeiro login e na configuração dos dados da empresa.
            Clientes que começam a faturar rapidamente tornam-se assinantes perpétuos.
          </p>
        </div>
      </div>
    </div>
  );
}

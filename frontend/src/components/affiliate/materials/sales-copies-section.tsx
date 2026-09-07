import { Icon } from "@workspace/ui";
import { SALES_COPIES } from "@/constants/marketing-materials";
import { SalesCopyCard } from "./sales-copy-card";

interface SalesCopiesSectionProps {
  onCopy: (text: string, title: string) => void;
}

export function SalesCopiesSection({ onCopy }: SalesCopiesSectionProps) {
  return (
    <div
      data-tour="sales-copies-section"
      className="space-y-5 pt-4 border-t border-border"
    >
      <div>
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Icon name="FileText" size={20} className="text-primary" />
          Textos e Roteiros Comerciais Prontos para WhatsApp
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Copie estas mensagens persuasivas testadas para apresentar o Mindgest a
          diferentes nichos de negócio. O seu link de parceiro é inserido
          automaticamente no texto copiado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SALES_COPIES.map((copy) => (
          <SalesCopyCard key={copy.id} copy={copy} onCopy={onCopy} />
        ))}
      </div>
    </div>
  );
}

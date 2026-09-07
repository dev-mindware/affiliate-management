import { Badge, Icon } from "@workspace/ui";
import { SalesCopy } from "@/constants/marketing-materials";

interface SalesCopyCardProps {
  copy: SalesCopy;
  onCopy: (text: string, title: string) => void;
}

export function SalesCopyCard({ copy, onCopy }: SalesCopyCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/30 transition-all">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-foreground">{copy.title}</h4>
          <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">
            {copy.badge}
          </Badge>
        </div>
        <div className="rounded-xl bg-muted/40 p-3.5 border border-border/60">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {copy.text}
          </pre>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Icon name="Lightbulb" size={13} className="text-amber-500 shrink-0" />
          <span>Não se esqueça de anexar o seu link de parceiro.</span>
        </span>
        <button
          data-tour="copy-share-button"
          type="button"
          onClick={() => onCopy(copy.text, copy.title)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer"
        >
          <Icon name="Copy" size={13} />
          Copiar Mensagem
        </button>
      </div>
    </div>
  );
}

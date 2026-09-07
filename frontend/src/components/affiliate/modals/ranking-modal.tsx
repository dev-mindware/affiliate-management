"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Icon,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { AffiliateRanking } from "../ranking/affiliate-ranking";

export function RankingModal() {
  const { open, closeModal } = useModalStore();
  const isOpen = !!open["view-ranking"];

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("view-ranking")}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 md:p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl">
        {/* Header Fixo */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/60 bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs border border-amber-500/20">
              <Icon name="Trophy" className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                Ranking de Parceiros Mindgest
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                Classificação nacional dos afiliados por clientes ativos e bónus de carreira.
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => closeModal("view-ranking")}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0 cursor-pointer"
            aria-label="Fechar modal de ranking"
          >
            <Icon name="X" className="size-4" />
          </Button>
        </div>

        {/* Corpo com Scroll Vertical */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 overscroll-contain">
          <AffiliateRanking />
        </div>

        {/* Rodapé Fixo */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-border/60 bg-card/50 shrink-0">
          <p className="text-xs text-muted-foreground text-center sm:text-left flex items-center gap-1.5">
            <Icon name="Sparkles" className="size-3.5 text-primary shrink-0" />
            <span>Atualizado em tempo real conforme as subscrições dos clientes.</span>
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => closeModal("view-ranking")}
              className="text-xs font-semibold cursor-pointer"
            >
              Fechar
            </Button>
            <Button
              asChild
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer"
              onClick={() => closeModal("view-ranking")}
            >
              <Link href="/ranking">
                <span>Ver Página Completa</span>
                <Icon name="ArrowRight" className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RankingModal;

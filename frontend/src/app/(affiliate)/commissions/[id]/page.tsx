"use client";

import { use } from "react";
import Link from "next/link";
import { useCommissions } from "@/hooks/affiliate";
import { PageWrapper } from "@/components";
import { ItemStatusBadge, Skeleton, Icon } from "@workspace/ui";
import { formatCurrency, formatDate } from "@workspace/utils";

export default function CommissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: commissions, isLoading } = useCommissions();
  const commission = commissions?.find((item) => String(item.id) === resolvedParams.id);

  if (isLoading) {
    return (
      <PageWrapper subRoute="Detalhes da Comissão">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper subRoute="Detalhes da Comissão">
      <div className="space-y-6 max-w-xl mx-auto">
        <Link
          href="/commissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Icon name="ArrowLeft" className="size-4" />
          Voltar para Minhas Comissões
        </Link>

        {!commission ? (
          <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Comissão não encontrada.
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{commission.client_nome}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Comissão Gerada por Venda</p>
              </div>
              <ItemStatusBadge status={commission.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Valor da Venda
                </p>
                <p className="font-bold text-foreground">{formatCurrency(commission.valor_servico)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Valor da Comissão
                </p>
                <p className="font-bold text-primary">{formatCurrency(commission.valor_comissao)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data da Comissão
                </p>
                <p className="font-semibold text-foreground">{formatDate(commission.created_at)}</p>
              </div>
              {commission.approved_at && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Aprovada em
                  </p>
                  <p className="font-semibold text-foreground">{formatDate(commission.approved_at)}</p>
                </div>
              )}
            </div>

            {commission.comprovativo_url && (
              <div className="pt-4 border-t">
                <a
                  href={commission.comprovativo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition-all"
                >
                  <Icon name="FileText" className="size-4" />
                  Ver Comprovativo de Pagamento
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { useLeads } from "@/hooks/affiliate";
import { PageWrapper } from "@/components";
import { ItemStatusBadge, Skeleton, Icon } from "@workspace/ui";
import { formatDate } from "@workspace/utils";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: leads, isLoading } = useLeads();
  const lead = leads?.find((item) => String(item.id) === resolvedParams.id);

  if (isLoading) {
    return (
      <PageWrapper subRoute="Detalhes do Lead">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper subRoute="Detalhes do Lead">
      <div className="space-y-6 max-w-xl mx-auto">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Icon name="ArrowLeft" className="size-4" />
          Voltar para Meus Leads
        </Link>

        {!lead ? (
          <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Lead não encontrado.
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{lead.client_nome}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{lead.client_telefone}</p>
              </div>
              <ItemStatusBadge status={lead.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data de Registo
                </p>
                <p className="font-semibold text-foreground">{formatDate(lead.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Última Atualização
                </p>
                <p className="font-semibold text-foreground">{formatDate(lead.updated_at || lead.created_at)}</p>
              </div>
            </div>

            {lead.notas && (
              <div className="space-y-1 pt-4 border-t text-xs sm:text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notas / Observações
                </p>
                <p className="p-3 rounded-xl bg-muted/40 text-foreground">{lead.notas}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

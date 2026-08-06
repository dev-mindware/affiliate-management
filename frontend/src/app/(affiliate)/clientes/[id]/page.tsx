"use client";

import { use } from "react";
import Link from "next/link";
import { useMyClients } from "@/hooks/affiliate";
import { PageWrapper } from "@/components";
import { Skeleton, Icon } from "@workspace/ui";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading } = useMyClients({ limit: 100 });
  const client = data?.data?.find((item) => String(item.id) === resolvedParams.id);

  if (isLoading) {
    return (
      <PageWrapper subRoute="Detalhes do Cliente">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  const plan = client?.current_plan;
  let planColor = "bg-primary/10 text-primary border-primary/20";
  if (plan === "PRO") {
    planColor = "bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400";
  } else if (plan === "SMART") {
    planColor = "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400";
  }

  const status = client?.subscription_status;
  let statusColor = "bg-muted text-muted-foreground";
  let statusLabel = status;
  if (status === "NEW") {
    statusColor = "bg-primary/10 text-primary border border-primary/20";
    statusLabel = "Nova Subscrição";
  } else if (status === "RENEWED") {
    statusColor = "bg-blue-500/15 text-blue-600 dark:text-blue-400";
    statusLabel = "Renovada";
  } else if (status === "EXPIRED") {
    statusColor = "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    statusLabel = "Expirada";
  } else if (status === "CANCELLED") {
    statusColor = "bg-destructive/15 text-destructive border border-destructive/20";
    statusLabel = "Cancelada";
  }

  return (
    <PageWrapper subRoute="Detalhes do Cliente">
      <div className="space-y-6 max-w-xl mx-auto">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Icon name="ArrowLeft" className="size-4" />
          Voltar para Meus Clientes
        </Link>

        {!client ? (
          <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Cliente não encontrado.
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{client.company_name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{client.company_email}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${planColor}`}>
                Plano {client.current_plan}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  NIF da Empresa
                </p>
                <p className="font-mono font-semibold text-foreground">
                  {client.company_tax_number || "Não Informado"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Estado da Subscrição
                </p>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Proprietário / Contacto
                </p>
                <p className="font-semibold text-foreground">{client.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Telefone
                </p>
                <p className="font-semibold text-foreground">{client.phone || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

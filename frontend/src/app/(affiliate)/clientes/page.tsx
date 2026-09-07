"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageWrapper, TitleList } from "@/components";
import {
  GenericTable,
  Column,
  ListSkeleton,
  RequestError,
  Icon,
} from "@workspace/ui";
import { useMyClients } from "@/hooks/affiliate";
import { ReferredClient } from "@/services/client-service";
import { MobileCard } from "@/components/shared/mobile-card";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>("");
  const [plan, setPlan] = useState<string | undefined>("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const limit = 10;

  const { data, isLoading, isError, refetch } = useMyClients({
    search: search || undefined,
    status: status || undefined,
    plan: plan || undefined,
    page,
    limit,
  });

  const columns: Column<ReferredClient>[] = [
    {
      key: "company_name",
      header: "Empresa / Cliente",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{item.company_name}</span>
          <span className="text-xs text-muted-foreground">{item.company_email}</span>
        </div>
      ),
    },
    {
      key: "tax_number",
      header: "NIF",
      render: (_, item) => (
        <span className="font-mono text-sm text-foreground">
          {item.company_tax_number || "Não Informado"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Proprietário",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.phone}</span>
        </div>
      ),
    },
    {
      key: "current_plan",
      header: "Plano",
      render: (_, item) => {
        const plan = item.current_plan;
        const color =
          plan === "PRO"
            ? "bg-primary/10 text-primary border-primary/20"
            : plan === "SMART"
            ? "bg-muted text-foreground border-border"
            : "bg-muted text-muted-foreground border-border";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
            {plan}
          </span>
        );
      },
    },
    {
      key: "subscription_status",
      header: "Estado",
      render: (_, item) => {
        const status = item.subscription_status;
        let color = "bg-muted text-muted-foreground border-border";
        let label = status;

        if (status === "NEW") {
          color = "bg-primary/10 text-primary border border-primary/20";
          label = "Nova Subscrição";
        } else if (status === "RENEWED") {
          color = "bg-muted text-foreground border border-border";
          label = "Renovada";
        } else if (status === "EXPIRED") {
          color = "bg-muted text-muted-foreground border border-border";
          label = "Expirada";
        } else if (status === "CANCELLED") {
          color = "bg-destructive/10 text-destructive border border-destructive/20";
          label = "Cancelada";
        } else if (status === "TRIALING") {
          color = "bg-muted text-muted-foreground border border-border";
          label = "Período de Teste";
        } else if (status === "PENDING") {
          color = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
          label = "Pendente";
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>
            {label}
          </span>
        );
      },
    },
  ];

  if (isError) {
    return (
      <PageWrapper subRoute="Meus Clientes">
        <RequestError refetch={refetch} message="Erro ao carregar clientes do MindGest" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper subRoute="Meus Clientes" tourId="clientes">
      <div className="space-y-6">
        <div data-tour="clients-header">
          <TitleList
            title="Meus Clientes Indicados"
            suTitle="Visualize as empresas registradas na plataforma principal que usaram o seu código de afiliado."
          />
        </div>

        <div data-tour="clients-search" className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-xl border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              className="pl-9 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-col">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value || undefined);
                setPage(1);
              }}
            >
              <option value="">Todos os Estados</option>
              <option value="NEW">Novos Clientes</option>
              <option value="RENEWED">Renovações</option>
              <option value="TRIALING">Período de Teste (Trial)</option>
              <option value="PENDING">Pendentes</option>
              <option value="EXPIRED">Expirados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>

          <div className="flex flex-col">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value || undefined);
                setPage(1);
              }}
            >
              <option value="">Todos os Planos</option>
              <option value="BASE">Base</option>
              <option value="SMART">Smart</option>
              <option value="PRO">Pro</option>
            </select>
          </div>
        </div>

        {/* Anti-churn advice callout */}
        <div data-tour="anti-churn-badge" className="rounded-xl border bg-card p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Icon name="ShieldAlert" className="size-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">Prevenção Anti-Churn:</strong> Dispõe de 7 dias de carência para auxiliar clientes com pagamento pendente a renovar a licença e manter a sua comissão recorrente.
            </span>
          </div>
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : (
          <div className="space-y-4">
            {/* Mobile View: Dedicated MobileCard & Page Navigation */}
            <div className="block sm:hidden space-y-3">
              {!data?.data || data.data.length === 0 ? (
                <div className="text-center py-8 px-4 border rounded-2xl bg-card text-muted-foreground text-xs">
                  Os clientes que usarem o seu código de afiliado aparecerão aqui assim que se registrarem.
                </div>
              ) : (
                data.data.map((item) => {
                  const plan = item.current_plan;
                  const planColor =
                    plan === "PRO"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-foreground border-border";

                  return (
                    <MobileCard
                      key={item.id}
                      title={item.company_name}
                      subtitle={item.company_email}
                      icon="Building"
                      badge={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${planColor}`}>
                          {plan}
                        </span>
                      }
                      fields={[
                        { label: "Proprietário", value: item.name },
                        { label: "Contacto", value: item.phone || "—" },
                      ]}
                      footerAction={
                        <Link
                          href={`/clientes/${item.id}`}
                          className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver Detalhes <Icon name="ChevronRight" className="size-3.5" />
                        </Link>
                      }
                      onClick={() => router.push(`/clientes/${item.id}`)}
                    />
                  );
                })
              )}
            </div>

            {/* Desktop View: Generic Table */}
            <div data-tour="clients-table" className="hidden sm:block">
              <GenericTable<ReferredClient>
                data={data?.data || []}
                columns={columns}
                emptyTitle="Nenhum cliente indicado encontrado"
                emptyDescription="Os clientes que usarem o seu código de afiliado aparecerão aqui assim que se registrarem."
                emptyIcon="Users"
              />
            </div>

            {data && data.totalPages > 1 && (
              <div data-tour="clients-support-note" className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  Página {data.page} de {data.totalPages} ({data.total} clientes no total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!data.hasPrevious}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Anterior
                  </button>
                  <button
                    disabled={!data.hasNext}
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

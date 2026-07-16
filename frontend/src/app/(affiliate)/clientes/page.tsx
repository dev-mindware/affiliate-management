"use client";

import { PageWrapper, TitleList } from "@/components";
import {
  GenericTable,
  Column,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { useMyClients } from "@/hooks/affiliate";
import { ReferredClient } from "@/services/client-service";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>("");
  const [plan, setPlan] = useState<string | undefined>("");
  const [page, setPage] = useState(1);
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
        let color = "bg-primary/10 text-primary border-primary/20";
        if (plan === "PRO") {
          color = "bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-900/50";
        } else if (plan === "SMART") {
          color = "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-900/50";
        }
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
        let color = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
        let label = status;

        if (status === "NEW") {
          color = "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400";
          label = "Nova Subscrição";
        } else if (status === "RENEWED") {
          color = "bg-blue-500/15 text-blue-600 border border-blue-500/20 dark:text-blue-400";
          label = "Renovada";
        } else if (status === "EXPIRED") {
          color = "bg-amber-500/15 text-amber-600 border border-amber-500/20 dark:text-amber-400";
          label = "Expirada";
        } else if (status === "CANCELLED") {
          color = "bg-destructive/15 text-destructive border border-destructive/20";
          label = "Cancelada";
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${color}`}>
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
    <PageWrapper subRoute="Meus Clientes">
      <div className="space-y-6">
        <TitleList
          title="Meus Clientes Indicados"
          suTitle="Visualize as empresas registradas na plataforma principal que usaram o seu código de afiliado."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-xl border">
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

        {isLoading ? (
          <ListSkeleton />
        ) : (
          <div className="space-y-4">
            <GenericTable<ReferredClient>
              data={data?.data || []}
              columns={columns}
              emptyTitle="Nenhum cliente indicado encontrado"
              emptyDescription="Os clientes que usarem o seu código de afiliado aparecerão aqui assim que se registrarem."
              emptyIcon="Users"
            />

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Página {data.page} de {data.totalPages} ({data.total} clientes no total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!data.hasPrevious}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" /> Anterior
                  </button>
                  <button
                    disabled={!data.hasNext}
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo <ArrowRight className="h-4 w-4" />
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

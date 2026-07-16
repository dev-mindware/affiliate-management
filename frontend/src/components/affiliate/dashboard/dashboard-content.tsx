"use client";

import { useState } from "react";
import { useDashboardChart, useDashboardKPIs, useProfile, useWithdrawalRequests } from "@/hooks/affiliate";
import { toast } from "sonner";
import {
  Badge,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Column,
  DynamicMetricCard,
  GenericTable,
  ItemStatusBadge,
  Progress,
  Skeleton,
} from "@workspace/ui";
import { formatCurrency, formatDate } from "@workspace/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const levelLabels: Record<string, string> = {
  none: "Sem nível",
  silver: "Silver Partner",
  gold: "Gold Partner",
  platinum: "Platinum Partner",
  elite: "Elite Partner",
};

const certificationLabels: Record<string, string> = {
  not_eligible: "Ainda não elegível",
  eligible: "Elegível para certificação",
  approved: "Parceiro certificado",
  rejected: "Certificação rejeitada",
};

const chartConfig = {
  comissao: { label: "Comissões", color: "#16a34a" },
} satisfies ChartConfig;

const compactCurrency = (value: number) =>
  new Intl.NumberFormat("pt-AO", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const MINDGEST_URL = process.env.NEXT_PUBLIC_MINDGEST_APP_URL || "http://localhost:3000";

const withdrawalColumns: Column<any>[] = [
  {
    key: "created_at",
    header: "Data",
    render: (_, item) => <div className="text-sm">{formatDate(item.created_at)}</div>,
  },
  {
    key: "valor",
    header: "Valor",
    render: (_, item) => <div className="text-sm font-medium">{formatCurrency(item.valor)}</div>,
  },
  {
    key: "status",
    header: "Estado",
    render: (_, item) => <ItemStatusBadge status={item.status} />,
  },
  {
    key: "conta",
    header: "Conta Bancária",
    render: (_, item) => (
      <div className="text-sm text-muted-foreground">
        {[item.banco, item.conta_bancaria].filter(Boolean).join(" - ") || "—"}
      </div>
    ),
  },
  {
    key: "comprovativo",
    header: "Comprovativo",
    render: (_, item) =>
      item.comprovativo_url ? (
        <a
          href={item.comprovativo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Ver
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
];

export function DashboardContent() {
  const [chartPeriod, setChartPeriod] = useState<"monthly" | "annual">("monthly");
  const { data: kpis, isLoading: isKPIsLoading } = useDashboardKPIs();
  const { data: chartDataRaw, isLoading: isChartLoading } = useDashboardChart(chartPeriod);
  const { data: withdrawals, isLoading: isWithdrawalsLoading } = useWithdrawalRequests(undefined, 5);
  const { data: profile } = useProfile();

  const chartData = (chartDataRaw || []).map((item: any) => ({
    date: item.date,
    label: item.label ?? item.date,
    comissao: Number(item.comissao || 0),
  }));

  if (isKPIsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-md" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  const program = kpis?.partner_program;
  const progressValue = program?.next_level
    ? Math.min(100, (program.active_clients / (program.active_clients + program.clients_to_next_level)) * 100)
    : 100;

  const referralLink = profile?.codigo_afiliado ? `${MINDGEST_URL}/auth/register?ref=${profile.codigo_afiliado}` : "";

  return (
    <div className="space-y-6">
      {program && (
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{levelLabels[program.partner_level] ?? program.partner_level}</Badge>
                <Badge variant={program.certification_status === "approved" ? "default" : "outline"}>
                  {certificationLabels[program.certification_status] ?? program.certification_status}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Mindgest Partners Program</h3>
                <p className="text-sm text-muted-foreground">
                  {program.active_clients} clientes ativos
                  {program.next_level
                    ? ` - faltam ${program.clients_to_next_level} para ${levelLabels[program.next_level]}`
                    : " - nível máximo alcançado"}
                </p>
                {profile?.codigo_afiliado && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Código de Indicação:</span>
                      <code className="px-2.5 py-1 bg-muted rounded border text-xs font-mono font-bold text-primary select-all">
                        {profile.codigo_afiliado}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(profile.codigo_afiliado);
                          toast.success("Código de afiliado copiado com sucesso!");
                        }}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Copiar
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Link de Convite:</span>
                      <code className="max-w-full truncate px-2.5 py-1 bg-muted rounded border text-xs font-mono text-muted-foreground select-all">
                        {referralLink}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(referralLink);
                          toast.success("Link de convite copiado! Partilhe com os seus clientes.");
                        }}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Copiar link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso do nível</span>
                <span>{program.recurring_bonus_percent}% bónus recorrente</span>
              </div>
              <Progress value={progressValue} />
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DynamicMetricCard
          title={formatCurrency(kpis?.available_balance || 0)}
          subtitle="Saldo Disponível"
          description="Pronto para levantamento."
          icon="Wallet"
        />
        <DynamicMetricCard
          title={formatCurrency(kpis?.pending_balance || 0)}
          subtitle="Saldo Pendente"
          description="Comissões em validação."
          icon="Clock"
        />
        <DynamicMetricCard
          title={formatCurrency(kpis?.total_earned || 0)}
          subtitle="Total Ganho"
          description="Histórico total de ganhos."
          icon="BadgeDollarSign"
        />
        <DynamicMetricCard
          title={program?.active_clients ?? 0}
          subtitle="Clientes Ativos"
          description="Subscrições ativas atribuídas."
          icon="Users"
        />
        {kpis?.rank_info && (
          <DynamicMetricCard
            title={`${kpis.rank_info.rank}º Lugar`}
            subtitle="Sua Posição"
            description={
              kpis.rank_info.distance_to_next > 0
                ? `Faltam ${kpis.rank_info.distance_to_next} clientes para subir.`
                : "Você está no topo."
            }
            icon="Trophy"
          />
        )}
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Evolução das Comissões</h3>
            <p className="text-sm text-muted-foreground">
              {chartPeriod === "monthly" ? "Total de comissões por dia (mês atual)" : "Total de comissões por mês (ano atual)"}
            </p>
          </div>
          <div className="inline-flex rounded-md border bg-muted/40 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setChartPeriod("monthly")}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                chartPeriod === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setChartPeriod("annual")}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                chartPeriod === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        {isChartLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="fillComissao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-comissao)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-comissao)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={(v) => compactCurrency(Number(v))}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area dataKey="comissao" type="natural" stroke="var(--color-comissao)" fill="url(#fillComissao)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        )}
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h3 className="text-xl font-bold">Levantamentos Recentes</h3>
          <p className="text-sm text-muted-foreground">Os seus 5 últimos pedidos de levantamento</p>
        </div>

        <GenericTable
          data={withdrawals || []}
          columns={withdrawalColumns}
          isLoading={isWithdrawalsLoading}
          emptyTitle="Sem levantamentos"
          emptyDescription="Ainda não solicitou nenhum levantamento."
          emptyIcon="History"
        />
      </section>
    </div>
  );
}

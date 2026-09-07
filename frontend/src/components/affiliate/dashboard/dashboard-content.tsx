"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardChart, useDashboardKPIs, useProfile, useWithdrawalRequests } from "@/hooks/affiliate";
import { toast } from "sonner";
import {
  Badge,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Column,
  GenericTable,
  Icon,
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

type DashboardContentProps = {
  /** URL público do app MindGest (link de indicação). Passado pelo server component. */
  mindgestAppUrl: string;
};

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

export function DashboardContent({ mindgestAppUrl }: DashboardContentProps) {
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 sm:h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[350px] w-full rounded-2xl" />
      </div>
    );
  }

  const program = kpis?.partner_program;
  const progressValue = program?.next_level
    ? Math.min(100, (program.active_clients / (program.active_clients + program.clients_to_next_level)) * 100)
    : 100;

  const mindgestBase = mindgestAppUrl.replace(/\/+$/, "");
  const referralLink = profile?.codigo_afiliado
    ? `${mindgestBase}/auth/register?ref=${profile.codigo_afiliado}`
    : "";

  return (
    <div className="space-y-6">
      {/* ── Link de Afiliado & Código Exclusivo ── */}
      <section className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon name="Link" className="size-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Seu Link de Afiliado & Código Exclusivo
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Partilhe este link com novos clientes do Mindgest para vincular comissões perpétuas.
            </p>
          </div>

          {profile?.codigo_afiliado && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Olá! Registe a sua empresa no software de faturação certificado Mindgest através deste link: ${referralLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-background hover:bg-muted text-foreground px-3.5 py-2 text-xs font-semibold transition-all shadow-2xs shrink-0"
              >
                <Icon name="Share2" className="size-3.5 text-muted-foreground" />
                <span>Partilhar no WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card Código */}
          <div data-tour="referral-code" className="rounded-xl border bg-background/80 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Código de Afiliado
              </span>
              <p className="text-base font-mono font-bold text-primary truncate select-all">
                {profile?.codigo_afiliado || "A carregar..."}
              </p>
            </div>
            <button
              type="button"
              disabled={!profile?.codigo_afiliado}
              onClick={() => {
                if (profile?.codigo_afiliado) {
                  navigator.clipboard.writeText(profile.codigo_afiliado);
                  toast.success("Código de afiliado copiado!");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0 disabled:opacity-50"
            >
              <Icon name="Copy" className="size-3.5" />
              <span>Copiar</span>
            </button>
          </div>

          {/* Card Link */}
          <div data-tour="referral-link" className="md:col-span-2 rounded-xl border bg-background/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0 space-y-0.5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Link Oficial de Indicação
              </span>
              <p className="text-xs font-mono text-foreground/80 truncate select-all">
                {referralLink || `${mindgestBase}/auth/register?ref=...`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!referralLink}
                onClick={() => {
                  if (referralLink) {
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Link de convite copiado!");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Icon name="Copy" className="size-3.5" />
                <span>Copiar Link</span>
              </button>
              {referralLink && (
                <a
                  href={referralLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Testar link no navegador"
                >
                  <Icon name="ExternalLink" className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mindgest Partners Program Career Level ── */}
      {program && (
        <section data-tour="partner-program" className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs">
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
              </div>
            </div>

            <div data-tour="level-progress" className="w-full lg:max-w-sm">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso do nível</span>
                <span>{program.recurring_bonus_percent}% bónus recorrente</span>
              </div>
              <Progress value={progressValue} />
            </div>
          </div>
        </section>
      )}

      {/* Materials Promo Callout Banner */}
      <section data-tour="materials-banner" className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon name="FolderDown" className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Materiais de Apoio & Divulgação
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Banners oficiais do Mindgest e roteiros de vendas para divulgar e aumentar as suas comissões.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/mindgest-materiais-parceiros.zip"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Icon name="Download" className="size-3.5" />
              <span>Baixar ZIP (2.8 MB)</span>
            </a>
            <Link
              href="/materiais"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            >
              <span>Ver Materiais</span>
              <Icon name="ArrowRight" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Cards Grid - 2x2 on Mobile */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Card 1: Saldo Disponível */}
        <div data-tour="kpi-available" className="rounded-2xl border bg-card p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
              Saldo Disponível
            </span>
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Icon name="Wallet" className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <h4 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
              {formatCurrency(kpis?.available_balance || 0)}
            </h4>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-primary" />
              Pronto a retirar
            </span>
          </div>
        </div>

        {/* Card 2: Saldo Pendente */}
        <div data-tour="kpi-pending" className="rounded-2xl border bg-card p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
              Saldo Pendente
            </span>
            <div className="p-1.5 sm:p-2 rounded-full bg-muted text-muted-foreground shrink-0">
              <Icon name="Clock" className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <h4 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
              {formatCurrency(kpis?.pending_balance || 0)}
            </h4>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              Em validação
            </span>
          </div>
        </div>

        {/* Card 3: Total Ganho */}
        <div data-tour="kpi-total" className="rounded-2xl border bg-card p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
              Total Ganho
            </span>
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Icon name="BadgeDollarSign" className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <h4 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
              {formatCurrency(kpis?.total_earned || 0)}
            </h4>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Histórico total
            </span>
          </div>
        </div>

        {/* Card 4: Clientes Ativos */}
        <div data-tour="kpi-clients" className="rounded-2xl border bg-card p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
              Clientes Ativos
            </span>
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Icon name="Users" className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <h4 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
              {program?.active_clients ?? 0}
            </h4>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Subscrições
            </span>
          </div>
        </div>

        {/* Card 5: Sua Posição */}
        {kpis?.rank_info && (
          <div data-tour="kpi-rank" className="col-span-2 sm:col-span-1 rounded-2xl border bg-card p-3.5 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                Sua Posição
              </span>
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary shrink-0">
                <Icon name="Trophy" className="size-3.5 sm:size-4" />
              </div>
            </div>
            <div className="my-1.5 sm:my-2">
              <h4 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
                {kpis.rank_info.rank}º Lugar
              </h4>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate">
                {kpis.rank_info.distance_to_next > 0
                  ? `Faltam ${kpis.rank_info.distance_to_next} clientes`
                  : "No topo do ranking"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Chart Section */}
      <section data-tour="commission-chart" className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs">
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-bold text-foreground">Evolução das Comissões</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {chartPeriod === "monthly" ? "Total de comissões por dia (mês atual)" : "Total de comissões por mês (ano atual)"}
            </p>
          </div>
          <div className="inline-flex rounded-full border bg-muted/50 p-1 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartPeriod("monthly")}
              className={`rounded-full px-3.5 py-1.5 font-medium transition-all ${
                chartPeriod === "monthly" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setChartPeriod("annual")}
              className={`rounded-full px-3.5 py-1.5 font-medium transition-all ${
                chartPeriod === "annual" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        {isChartLoading ? (
          <Skeleton className="h-[240px] sm:h-[300px] w-full rounded-xl" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] sm:h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fillComissao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-comissao)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-comissao)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickFormatter={(v) => compactCurrency(Number(v))}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4 text-xs">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area dataKey="comissao" type="monotone" stroke="var(--color-comissao)" fill="url(#fillComissao)" strokeWidth={2.5} />
            </AreaChart>
          </ChartContainer>
        )}
      </section>

      {/* Recent Withdrawals Section */}
      <section data-tour="recent-withdrawals" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-xl font-bold text-foreground">Levantamentos Recentes</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Os seus últimos 5 pedidos de levantamento</p>
          </div>
          <Link
            href="/wallet"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            Ver todos <Icon name="ChevronRight" className="size-3.5 sm:size-4" />
          </Link>
        </div>

        {/* Mobile View: Clean Card Activity List (max 5) */}
        <div className="block sm:hidden space-y-2.5 w-full">
          {isWithdrawalsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))
          ) : !withdrawals || withdrawals.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border bg-card text-muted-foreground text-xs">
              <Icon name="History" className="size-8 mx-auto mb-2 opacity-50" />
              Ainda não solicitou nenhum levantamento.
            </div>
          ) : (
            withdrawals.slice(0, 5).map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon name="ArrowUpRight" className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{formatCurrency(item.valor)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(item.created_at)}</p>
                    {(item.banco || item.conta_bancaria) && (
                      <p className="text-[10px] text-muted-foreground/80 truncate">
                        {[item.banco, item.conta_bancaria].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <ItemStatusBadge status={item.status} />
                  {item.comprovativo_url && (
                    <a
                      href={item.comprovativo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Comprovativo
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Width Table (max 5) */}
        <div className="hidden sm:block w-full">
          <GenericTable
            data={(withdrawals || []).slice(0, 5)}
            columns={withdrawalColumns}
            isLoading={isWithdrawalsLoading}
            emptyTitle="Sem levantamentos"
            emptyDescription="Ainda não solicitou nenhum levantamento."
            emptyIcon="History"
          />
        </div>
      </section>
    </div>
  );
}


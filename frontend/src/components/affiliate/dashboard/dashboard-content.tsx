"use client";

import { useDashboardChart, useDashboardKPIs, useProfile } from "@/hooks/affiliate";
import { toast } from "sonner";
import {
  Badge,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  DynamicMetricCard,
  Progress,
  Skeleton,
} from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export function DashboardContent() {
  const { data: kpis, isLoading: isKPIsLoading } = useDashboardKPIs();
  const { data: chartDataRaw, isLoading: isChartLoading } = useDashboardChart();
  const { data: profile } = useProfile();

  const chartConfig = {
    value: {
      label: "Leads",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const chartData = (chartDataRaw || []).map((item: any) => ({
    name: new Date(item.date).toLocaleDateString("pt-PT", { weekday: "short" }),
    value: item.count || 0,
  }));

  if (isKPIsLoading || isChartLoading) {
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
                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
        <div className="mb-6 space-y-1">
          <h3 className="text-xl font-bold">Leads nos últimos 7 dias</h3>
          <p className="text-sm text-muted-foreground">Volume diário de captação</p>
        </div>

        <div className="h-[350px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "hsl(var(--primary)/0.05)" }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ChartContainer>
        </div>
      </section>
    </div>
  );
}

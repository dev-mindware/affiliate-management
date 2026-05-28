"use client";

import { useDashboardKPIs, useDashboardChart } from "@/hooks/affiliate";
import { DynamicMetricCard } from "@workspace/ui";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@workspace/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge, Progress, Skeleton } from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";

const levelLabels: Record<string, string> = {
    none: "Sem nível",
    silver: "Silver Partner",
    gold: "Gold Partner",
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

    const chartConfig = {
        value: {
            label: "Leads",
            color: "var(--primary)",
        },
    } satisfies ChartConfig;

    // Map raw data to chart format
    // Assumes response is like [{ date: "2024-01-01", count: 10 }]
    const chartData = (chartDataRaw || []).map((item: any) => ({
        name: new Date(item.date).toLocaleDateString('pt-PT', { weekday: 'short' }),
        value: item.count || 0
    }));

    if (isKPIsLoading || isChartLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            {kpis?.partner_program && (
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{levelLabels[kpis.partner_program.partner_level]}</Badge>
                                <Badge variant={kpis.partner_program.certification_status === "approved" ? "default" : "outline"}>
                                    {certificationLabels[kpis.partner_program.certification_status]}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight">Mindgest Partners Program</h3>
                                <p className="text-sm text-muted-foreground">
                                    {kpis.partner_program.active_clients} clientes activos
                                    {kpis.partner_program.next_level
                                        ? ` · faltam ${kpis.partner_program.clients_to_next_level} para ${levelLabels[kpis.partner_program.next_level]}`
                                        : " · nível máximo alcançado"}
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:max-w-sm">
                            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progresso do nível</span>
                                <span>{kpis.partner_program.recurring_bonus_percent}% bónus recorrente</span>
                            </div>
                            <Progress
                                value={kpis.partner_program.next_level ? Math.min(100, (kpis.partner_program.active_clients / (kpis.partner_program.active_clients + kpis.partner_program.clients_to_next_level)) * 100) : 100}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <DynamicMetricCard
                    title={formatCurrency(kpis?.available_balance || 0)}
                    subtitle="Saldo Disponível"
                    description="Pronto para levantamento."
                    icon="Wallet"
                />
                <DynamicMetricCard
                    title={formatCurrency(kpis?.pending_balance || 0)}
                    subtitle="Saldo Pendente"
                    description="Comissões em processamento."
                    icon="Clock"
                />
                <DynamicMetricCard
                    title={formatCurrency(kpis?.total_earned || 0)}
                    subtitle="Total Ganho"
                    description="Histórico total de ganhos."
                    icon="BadgeDollarSign"
                />
                <DynamicMetricCard
                    title={kpis?.partner_program?.active_clients ?? 0}
                    subtitle="Clientes Activos"
                    description="Subscrições activas atribuídas."
                    icon="Users"
                />
                {kpis?.rank_info && (
                    <DynamicMetricCard
                        title={`${kpis.rank_info.rank}º Lugar`}
                        subtitle="Sua Posição"
                        description={kpis.rank_info.distance_to_next > 0 
                            ? `Faltam ${kpis.rank_info.distance_to_next} clientes para subir.`
                            : "Você está no topo!"}
                        icon="Trophy"
                    />
                )}
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="mb-6 space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">Leads nos últimos 7 dias</h3>
                    <p className="text-muted-foreground text-sm">Volume diário de captação</p>
                </div>

                <div className="h-[350px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
                            <Bar
                                dataKey="value"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useWallet, useWithdrawalRequests, useWalletChart } from "@/hooks/affiliate";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    GenericTable,
    Column,
    Button,
    ItemStatusBadge,
    Skeleton,
    Icon,
    Badge,
} from "@workspace/ui";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "@workspace/utils";
import { useState } from "react";

const WITHDRAWAL_MINIMUM = 5000;

const chartConfig = {
    earned: { label: "Ganhos", color: "hsl(var(--primary))" },
    withdrawn: { label: "Levantado", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig;

const compactCurrency = (value: number) =>
    new Intl.NumberFormat("pt-AO", { notation: "compact", maximumFractionDigits: 1 }).format(value);

type ChartTab = "earned" | "withdrawn";

const STATUS_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
    pending:  { icon: "Clock",        color: "text-amber-600 dark:text-amber-400",  bgColor: "bg-amber-100 dark:bg-amber-900/40"  },
    approved: { icon: "CircleCheck",  color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/40" },
    rejected: { icon: "XCircle",      color: "text-destructive",                    bgColor: "bg-destructive/10"                  },
};

function WithdrawalActivityItem({ item }: { item: any }) {
    const status = (item.status ?? "").toLowerCase();
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

    return (
        <div className="flex items-center gap-3 py-3 border-b last:border-b-0">
            <div className={cn("flex items-center justify-center h-10 w-10 rounded-2xl shrink-0", cfg.bgColor)}>
                <Icon name={cfg.icon as any} className={cn("h-4.5 w-4.5", cfg.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Saque Solicitado</p>
                <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{formatCurrency(item.valor)}</p>
                <ItemStatusBadge status={item.status} />
            </div>
        </div>
    );
}

export function WalletContent() {
    const { data: wallet, isLoading: isLoadingWallet } = useWallet();
    const { data: withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawalRequests();
    const { data: chartData, isLoading: isLoadingChart } = useWalletChart();
    const { openModal } = useModalStore();
    const [chartTab, setChartTab] = useState<ChartTab>("earned");

    const canWithdraw = !!(wallet && wallet.saldo_disponivel >= WITHDRAWAL_MINIMUM);

    if (isLoadingWallet) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <Skeleton className="h-52 w-full rounded-3xl" />
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    const columns: Column<any>[] = [
        { key: "data_solicitacao", header: "Data", render: (_, item) => <div className="text-sm">{formatDate(item.created_at)}</div> },
        { key: "valor", header: "Valor", render: (_, item) => <div className="text-sm font-medium">{formatCurrency(item.valor)}</div> },
        { key: "status", header: "Status", render: (_, item) => <ItemStatusBadge status={item.status} /> },
        { key: "conta", header: "Conta Bancária", render: (_, item) => <div className="text-sm text-muted-foreground">{[item.banco, item.conta_bancaria].filter(Boolean).join(" - ")}</div> },
        {
            key: "comprovativo", header: "Comprovativo",
            render: (_, item) => item.comprovativo_url
                ? <a href={item.comprovativo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Ver</a>
                : <span className="text-sm text-muted-foreground">—</span>,
        },
    ];

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">

            {/* ── MOBILE LAYOUT ── */}
            <div className="block sm:hidden space-y-4">

                {/* Hero Balance Card */}
                <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground">
                    {/* Decorative blobs */}
                    <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon name="Wallet" className="h-4 w-4 opacity-80" />
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Saldo Disponível</p>
                        </div>
                        <p className="text-4xl font-extrabold tracking-tight mb-1">
                            {formatCurrency(wallet?.saldo_disponivel ?? 0)}
                        </p>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                            <Icon name="Clock" className="h-3.5 w-3.5 opacity-70" />
                            <span className="text-xs opacity-70">
                                Pendente: {formatCurrency(wallet?.saldo_pendente ?? 0)}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={() => openModal("request-withdrawal")}
                        disabled={!canWithdraw}
                        className="mt-5 w-full bg-white text-primary font-bold hover:bg-white/90 rounded-xl"
                        size="sm"
                    >
                        <Icon name="ArrowUpRight" className="h-4 w-4 mr-2" />
                        {canWithdraw ? "Solicitar Saque" : `Mínimo: ${formatCurrency(WITHDRAWAL_MINIMUM)}`}
                    </Button>
                </div>

                {/* Mini Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-card p-4 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                <Icon name="TrendingUp" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-xs font-medium">Total Ganho</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(wallet?.total_ganho ?? 0)}</p>
                    </div>
                    <div className="rounded-2xl border bg-card p-4 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                                <Icon name="CircleCheck" className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Total Recebido</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(wallet?.total_levantado ?? 0)}</p>
                    </div>
                </div>

                {/* Chart Card — Mobile */}
                <div className="rounded-2xl border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">Evolução (6 meses)</p>
                        {/* Tab pills */}
                        <div className="flex gap-1 bg-muted/60 p-0.5 rounded-xl">
                            {(["earned", "withdrawn"] as ChartTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setChartTab(tab)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                                        chartTab === tab
                                            ? "bg-card shadow text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {tab === "earned" ? "Ganhos" : "Saques"}
                                </button>
                            ))}
                        </div>
                    </div>
                    {isLoadingChart ? (
                        <Skeleton className="h-40 w-full rounded-xl" />
                    ) : (
                        <ChartContainer config={chartConfig} className="h-40 w-full">
                            <AreaChart data={chartData ?? []} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={`wallet-mobile-${chartTab}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartTab === "earned" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={chartTab === "earned" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey={chartTab}
                                    stroke={chartTab === "earned" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                                    strokeWidth={2}
                                    fill={`url(#wallet-mobile-${chartTab})`}
                                    dot={{ r: 3, fill: chartTab === "earned" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </div>

                {/* Activity Feed — Mobile */}
                <div className="rounded-2xl border bg-card p-4 space-y-1">
                    <p className="text-sm font-bold text-foreground mb-2">Histórico de Saques</p>
                    {isLoadingWithdrawals ? (
                        [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                    ) : !withdrawals || withdrawals.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-3 text-muted-foreground">
                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                                <Icon name="History" className="h-6 w-6" />
                            </div>
                            <p className="text-xs text-center">Nenhuma solicitação de saque ainda.<br />O seu histórico aparecerá aqui.</p>
                        </div>
                    ) : (
                        withdrawals.map((item: any) => (
                            <WithdrawalActivityItem key={item.id} item={item} />
                        ))
                    )}
                </div>
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden sm:block space-y-6">
                {/* Metric Cards Row */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Available Balance */}
                    <div className="rounded-2xl border bg-card p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Disponível</span>
                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon name="Wallet" className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground">{formatCurrency(wallet?.saldo_disponivel ?? 0)}</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">Valor pronto para saque.</p>
                        <Button
                            className="w-full"
                            size="sm"
                            onClick={() => openModal("request-withdrawal")}
                            disabled={!canWithdraw}
                        >
                            Solicitar Saque
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">Mínimo: {formatCurrency(WITHDRAWAL_MINIMUM)}</p>
                    </div>

                    {/* Pending Balance */}
                    <div className="rounded-2xl border bg-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Pendente</span>
                            <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Icon name="Clock" className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground">{formatCurrency(wallet?.saldo_pendente ?? 0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Comissões em processamento.</p>
                    </div>

                    {/* Total Received */}
                    <div className="rounded-2xl border bg-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recebido</span>
                            <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Icon name="CircleCheck" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-foreground">{formatCurrency(wallet?.total_levantado ?? 0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Histórico total de pagamentos.</p>
                    </div>
                </div>

                {/* Chart — Desktop */}
                <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base font-bold text-foreground">Evolução de Comissões (6 meses)</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Ganhos e levantamentos mensais.</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Ganhos</span>
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground inline-block" /> Saques</span>
                        </div>
                    </div>
                    {isLoadingChart ? (
                        <Skeleton className="h-56 w-full rounded-xl" />
                    ) : (
                        <ChartContainer config={chartConfig} className="h-56 w-full">
                            <AreaChart data={chartData ?? []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="wallet-earned" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="wallet-withdrawn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="earned" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#wallet-earned)" dot={{ r: 3.5, fill: "hsl(var(--primary))", strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="withdrawn" stroke="hsl(var(--muted-foreground))" strokeWidth={2} fill="url(#wallet-withdrawn)" dot={{ r: 3.5, fill: "hsl(var(--muted-foreground))", strokeWidth: 0 }} />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </div>

                {/* History Table — Desktop */}
                <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <h3 className="text-base font-bold text-foreground">Histórico de Saques</h3>
                    <GenericTable
                        data={withdrawals || []}
                        columns={columns}
                        isLoading={isLoadingWithdrawals}
                        emptyTitle="Nenhum saque encontrado"
                        emptyDescription="Você ainda não realizou nenhuma solicitação de saque."
                        emptyIcon="History"
                    />
                </div>
            </div>
        </div>
    );
}

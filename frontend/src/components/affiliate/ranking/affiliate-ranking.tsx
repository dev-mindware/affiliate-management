"use client";

import { useRanking } from "@/hooks/affiliate";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    Badge,
    Avatar,
    AvatarFallback,
    Icon,
} from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";

interface RankingEntry {
    id: string;
    name: string;
    total_earned: number;
    conversions: number;
    active_clients: number;
    partner_level: string;
    rank: number;
}

export function AffiliateRanking() {
    const {
        data: rankingRaw,
        isLoading,
        isError,
        refetch,
    } = useRanking();

    const ranking: RankingEntry[] = (rankingRaw || []).map((item: any, index: number) => ({
        ...item,
        id: item.name || `rank-${index}`,
        active_clients: item.active_clients || 0,
        partner_level: item.partner_level || "none",
        rank: index + 1
    }));

    const columns: Column<RankingEntry>[] = [
        {
            key: "rank",
            header: "Posição",
            render: (_, item) => {
                const isTop3 = item.rank <= 3;
                return (
                    <div className="flex items-center justify-center w-8 h-8 font-bold">
                        {isTop3 ? (
                            <Badge className={`
                                ${item.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"}
                                size-8 flex items-center justify-center rounded-full text-sm font-bold shadow-2xs
                            `}>
                                {item.rank}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground text-sm">{item.rank}º</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "name",
            header: "Parceiro",
            render: (_, item) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 border border-border">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {item.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{item.name || "Parceiro"}</span>
                </div>
            ),
        },
        {
            key: "active_clients",
            header: "Clientes Activos",
            render: (_, item) => (
                <div className="text-sm font-medium text-foreground">
                    {item.active_clients}
                </div>
            ),
        },
        {
            key: "partner_level",
            header: "Nível",
            render: (_, item) => {
                const levelStyles: Record<string, string> = {
                    none: "bg-muted text-muted-foreground border-transparent",
                    silver: "bg-muted text-foreground border-border",
                    gold: "bg-primary/10 text-primary border-primary/20",
                    platinum: "bg-primary/15 text-primary border-primary/30",
                    elite: "bg-primary text-primary-foreground border-transparent",
                };
                const levelNames: Record<string, string> = {
                    none: "Sem nível",
                    silver: "Silver",
                    gold: "Gold",
                    platinum: "Platinum",
                    elite: "Elite",
                };
                const style = levelStyles[item.partner_level] ?? "bg-muted text-muted-foreground border-transparent";
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${style}`}>
                        {levelNames[item.partner_level] ?? item.partner_level}
                    </span>
                );
            },
        },
        {
            key: "total_earned",
            header: "Total Ganho",
            render: (_, item) => (
                <div className="text-sm font-bold text-primary">
                    {formatCurrency(item.total_earned)}
                </div>
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar ranking" />;
    }

    return (
        <div className="space-y-6">
            {/* Top 3 Podium */}
            {ranking.length >= 3 && (
                <div data-tour="ranking-podium" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ranking.slice(0, 3).map((item, idx) => (
                        <div key={item.id} className="rounded-2xl border bg-card p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:border-primary/30 transition-all">
                            <div className={`size-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm shadow-2xs ${
                                idx === 0 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted text-foreground border border-border"
                            }`}>
                                {idx + 1}º
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                                    {idx === 0 ? "Líder Nacional" : `${idx + 1}º Lugar`}
                                </p>
                                <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-primary font-semibold">{item.active_clients} clientes ativos</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tiers Table & Rules */}
            <div data-tour="ranking-tiers-table" className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Icon name="Award" className="size-4 text-primary" />
                            Escalões de Carreira & Bónus Recorrentes
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Cada escalão acrescenta uma percentagem perpétua às suas comissões mensais.</p>
                    </div>
                    <span data-tour="ranking-my-position" className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full self-start sm:self-auto">
                        Progressão Automática
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border bg-card space-y-1">
                        <p className="font-bold text-foreground">Silver Partner</p>
                        <p className="text-muted-foreground text-[11px]">15 Clientes Ativos</p>
                        <p className="text-primary font-bold mt-1">+5% Bónus Recorrente</p>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-card space-y-1">
                        <p className="font-bold text-foreground">Gold Partner</p>
                        <p className="text-muted-foreground text-[11px]">40 Clientes Ativos</p>
                        <p className="text-primary font-bold mt-1">+10% Bónus Recorrente</p>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-card space-y-1">
                        <p className="font-bold text-foreground">Platinum Partner</p>
                        <p className="text-muted-foreground text-[11px]">100 Clientes Ativos</p>
                        <p className="text-primary font-bold mt-1">+17% Bónus Recorrente</p>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-card space-y-1">
                        <p className="font-bold text-foreground">Elite Partner</p>
                        <p className="text-muted-foreground text-[11px]">250 Clientes Ativos</p>
                        <p className="text-primary font-bold mt-1">+23% Bónus Recorrente</p>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs space-y-4">
                <h4 className="text-base font-bold text-foreground">Classificação Geral de Afiliados</h4>
                <GenericTable<RankingEntry>
                    data={ranking || []}
                    columns={columns}
                    emptyTitle="Nenhum dado disponível"
                    emptyDescription="O ranking ainda não foi processado para este período."
                    emptyIcon="Trophy"
                />
            </div>

            {/* Certification & Growth Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-tour="ranking-certification-badge" className="rounded-2xl border bg-card p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Icon name="BadgeCheck" className="size-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground">Certificação Mindgest PRO</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Parceiros a partir do nível Silver podem solicitar a certificação comercial oficial para receber licença Mindgest PRO e leads corporativas da Mindware.
                        </p>
                    </div>
                </div>

                <div data-tour="ranking-tips" className="rounded-2xl border bg-card p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                    <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0">
                        <Icon name="Lightbulb" className="size-5 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground">Estratégia de Crescimento Rápido</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Apresente o Mindgest a minimercados, lojas de informática e restaurantes da sua região para atingir os primeiros 15 clientes ativos e desbloquear o bónus recorrente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

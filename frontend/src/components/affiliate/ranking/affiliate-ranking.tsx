"use client";

import { useRanking } from "@/hooks/affiliate";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    Badge,
    Avatar,
    AvatarFallback
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
                                ${item.rank === 1 ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                ${item.rank === 2 ? "bg-slate-400 hover:bg-slate-500" : ""}
                                ${item.rank === 3 ? "bg-amber-600 hover:bg-amber-700" : ""}
                                text-white border-none size-8 flex items-center justify-center rounded-full text-lg
                            `}>
                                {item.rank}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground">{item.rank}º</span>
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
                    none: "bg-muted text-muted-foreground",
                    silver: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
                    gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                    platinum: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
                    elite: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                };
                const levelNames: Record<string, string> = {
                    none: "Sem nível",
                    silver: "Silver",
                    gold: "Gold",
                    platinum: "Platinum",
                    elite: "Elite",
                };
                const style = levelStyles[item.partner_level] ?? "bg-muted text-muted-foreground";
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
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
        <div className="space-y-4">

            <GenericTable<RankingEntry>
                data={ranking || []}
                columns={columns}
                emptyTitle="Nenhum dado disponível"
                emptyDescription="O ranking ainda não foi processado para este período."
                emptyIcon="Trophy"
            />
        </div>
    );
}

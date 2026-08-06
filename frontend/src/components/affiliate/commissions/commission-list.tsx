"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCommissions } from "@/hooks/affiliate";
import { 
    GenericTable, 
    Column, 
    ListSkeleton, 
    RequestError, 
    ItemStatusBadge, 
    ButtonOnlyAction,
    FilterBar,
    Icon,
} from "@workspace/ui";
import { Commission, CommissionStatus } from "@workspace/types/affiliate";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { MobileCard } from "@/components/shared/mobile-card";

export function CommissionList() {
    const [status, setStatus] = useState<CommissionStatus | undefined>();
    const router = useRouter();

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useCommissions({ status });
    
    const { openModal } = useModalStore();

    const columns: Column<Commission>[] = [
        {
            key: "client_nome",
            header: "Cliente",
            render: (_, item) => (
                <div className="font-medium text-foreground">{item.client_nome}</div>
            ),
        },
        {
            key: "valor_servico",
            header: "Valor Venda",
            render: (_, item) => (
                <div className="text-sm text-foreground">
                    {formatCurrency(item.valor_servico)}
                </div>
            ),
        },
        {
            key: "valor_comissao",
            header: "Comissão",
            render: (_, item) => (
                <div className="text-sm font-semibold text-primary">
                    {formatCurrency(item.valor_comissao)}
                </div>
            ),
        },
        {
            key: "data",
            header: "Data",
            render: (_, item) => (
                <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (_, item) => (
                <ItemStatusBadge status={item.status} />
            ),
        },
        {
            key: "action",
            header: "Ações",
            render: (_, item) => (
                <ButtonOnlyAction
                    data={item}
                    actions={[
                        {
                            label: "Ver Detalhes",
                            icon: "Info",
                            onClick: (data) => openModal("view-commission-details", data),
                        },
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar comissões" />;
    }

    return (
        <div className="space-y-4">
            <FilterBar 
                label="Filtrar por Status"
                value={status || ""}
                onValueChange={(val) => setStatus(val as CommissionStatus)}
                options={[
                    { label: "Pendente", value: CommissionStatus.PENDING },
                    { label: "Aprovado", value: CommissionStatus.APPROVED },
                    { label: "Pago", value: CommissionStatus.PAID },
                    { label: "Rejeitado", value: CommissionStatus.REJECTED },
                ]}
            />

            {/* Mobile View: Dedicated MobileCard & Page Navigation */}
            <div className="block sm:hidden space-y-3">
                {!data || data.length === 0 ? (
                    <div className="text-center py-8 px-4 border rounded-2xl bg-card text-muted-foreground text-xs">
                        Não existem comissões registradas no momento.
                    </div>
                ) : (
                    data.map((item) => (
                        <MobileCard
                            key={item.id}
                            title={item.client_nome}
                            subtitle={`Comissão: ${formatCurrency(item.valor_comissao)}`}
                            icon="BadgeDollarSign"
                            badge={<ItemStatusBadge status={item.status} />}
                            fields={[
                                { label: "Valor Venda", value: formatCurrency(item.valor_servico) },
                                { label: "Data", value: formatDate(item.created_at) },
                            ]}
                            footerAction={
                                <Link
                                    href={`/commissions/${item.id}`}
                                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Ver Detalhes <Icon name="ChevronRight" className="size-3.5" />
                                </Link>
                            }
                            onClick={() => router.push(`/commissions/${item.id}`)}
                        />
                    ))
                )}
            </div>

            {/* Desktop View: Generic Table */}
            <div className="hidden sm:block">
                <GenericTable<Commission>
                    data={data || []}
                    columns={columns}
                    emptyTitle="Nenhuma comissão encontrada"
                    emptyDescription="Não existem comissões registradas no momento."
                    emptyIcon="Coins"
                />
            </div>
        </div>
    );
}

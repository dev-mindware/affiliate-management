"use client";

import { useWallet, useWithdrawalRequests } from "@/hooks/affiliate";
import { 
    DynamicMetricCard, 
    GenericTable, 
    Column, 
    Button, 
    ItemStatusBadge,
    Skeleton
} from "@workspace/ui";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";

const WITHDRAWAL_MINIMUM = 25000;

export function WalletContent() {
    const { data: wallet, isLoading: isLoadingWallet } = useWallet();
    const { data: withdrawals, isLoading: isLoadingWithdrawals } = useWithdrawalRequests();
    const { openModal } = useModalStore();

    if (isLoadingWallet) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
        );
    }

    const columns: Column<any>[] = [
        {
            key: "data_solicitacao",
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
            header: "Status",
            render: (_, item) => <ItemStatusBadge status={item.status} />,
        },
        {
            key: "conta",
            header: "Conta Bancária",
            render: (_, item) => (
                <div className="text-sm text-muted-foreground">
                    {item.banco} - {item.conta_bancaria}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DynamicMetricCard
                    title={formatCurrency(wallet?.saldo_disponivel || 0)}
                    subtitle="Saldo Disponível"
                    description="Valor pronto para saque."
                    icon="Wallet"
                >
                    <div className="mt-4 pt-4 border-t">
                        <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => openModal("request-withdrawal")}
                            disabled={!wallet || wallet.saldo_disponivel < WITHDRAWAL_MINIMUM}
                        >
                            Solicitar Saque
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Mínimo para saque: 25.000 Kz
                        </p>
                    </div>
                </DynamicMetricCard>
                <DynamicMetricCard
                    title={formatCurrency(wallet?.saldo_pendente || 0)}
                    subtitle="Saldo Pendente"
                    description="Comissões em processamento."
                    icon="Clock"
                />
                <DynamicMetricCard
                    title={formatCurrency(wallet?.total_levantado || 0)}
                    subtitle="Total Recebido"
                    description="Histórico total de pagamentos."
                    icon="CircleCheck"
                />
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">

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
    );
}

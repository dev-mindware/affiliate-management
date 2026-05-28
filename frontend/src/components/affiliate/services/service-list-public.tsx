"use client";

import { useDashboardKPIs, usePartnerProgramPlans } from "@/hooks/affiliate";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    ItemStatusBadge,
    Badge
} from "@workspace/ui";
import { PartnerProgramPlan } from "@workspace/types/affiliate";
import { formatCurrency } from "@workspace/utils";

export function ServiceListPublic() {
    const {
        data: plans,
        isLoading,
        isError,
        refetch,
    } = usePartnerProgramPlans();
    const { data: kpis } = useDashboardKPIs();

    const isCertified = kpis?.partner_program?.certification_status === "approved";

    const columns: Column<PartnerProgramPlan>[] = [
        {
            key: "name",
            header: "Plano",
            render: (_, item) => (
                <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.certified_only && (
                            <Badge variant={isCertified ? "default" : "outline"}>Certificado</Badge>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                </div>
            ),
        },
        {
            key: "price",
            header: "Valor Base",
            render: (_, item) => (
                <div className="text-sm text-foreground">
                    {item.code === "CUSTOM" ? `Min. ${formatCurrency(item.mindware_minimum_net || 14899.22)}` : formatCurrency(item.price)}
                </div>
            ),
        },
        {
            key: "first_monthly_percent",
            header: "Primeiro Pagamento",
            render: (_, item) => (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {item.code === "CUSTOM" ? "Variavel" : `${item.first_monthly_percent}%`}
                    </Badge>
                    <span className="text-sm font-semibold text-primary">
                        {item.code === "CUSTOM"
                            ? "Valor vendido - 14.899,22 Kz"
                            : formatCurrency((item.price * item.first_monthly_percent) / 100)}
                    </span>
                </div>
            ),
        },
        {
            key: "recurring_monthly_percent",
            header: "Recorrente",
            render: (_, item) => (
                <div className="text-sm text-foreground">
                    {item.code === "CUSTOM" ? "Negociado por venda" : `${item.recurring_monthly_percent}% + bonus de nivel`}
                </div>
            ),
        },
        {
            key: "active",
            header: "Status",
            render: (_, item) => (
                <ItemStatusBadge status={!item.certified_only || isCertified ? "active" : "inactive"} />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar planos Mindgest" />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight">Planos Mindgest</h2>
                <p className="text-sm text-muted-foreground">
                    Catálogo do Mindgest Partners Program com comissões por pagamento.
                </p>
            </div>

            <GenericTable<PartnerProgramPlan>
                data={plans || []}
                columns={columns}
                emptyTitle="Nenhum plano disponível"
                emptyDescription="No momento não existem planos Mindgest activos para promoção."
                emptyIcon="FileText"
            />
        </div>
    );
}

"use client";

import { useDashboardKPIs, usePartnerProgramPlans } from "@/hooks/affiliate";
import {
  Badge,
  Column,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { PartnerProgramPlan } from "@workspace/types/affiliate";
import { formatCurrency } from "@workspace/utils";

export function ServiceListPublic() {
  const {
    data: plans,
    isLoading: isPlansLoading,
    isError: isPlansError,
    refetch: refetchPlans,
  } = usePartnerProgramPlans();

  const { data: kpis } = useDashboardKPIs();
  const isCertified = kpis?.partner_program?.certification_status === "approved";

  const planColumns: Column<PartnerProgramPlan>[] = [
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
          {item.description && <span className="line-clamp-1 text-xs text-muted-foreground">{item.description}</span>}
        </div>
      ),
    },
    {
      key: "price",
      header: "Valor base",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatCurrency(item.price)}
        </div>
      ),
    },
    {
      key: "first_monthly_percent",
      header: "Primeiro pagamento",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
            {`${item.first_monthly_percent}%`}
          </Badge>
          <span className="text-sm font-semibold text-primary">
            {formatCurrency((item.price * item.first_monthly_percent) / 100)}
          </span>
        </div>
      ),
    },
    {
      key: "recurring_monthly_percent",
      header: "Recorrente",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {`${item.recurring_monthly_percent}% + bónus de nível`}
        </div>
      ),
    },
    {
      key: "active",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={!item.certified_only || isCertified ? "active" : "inactive"} />,
    },
  ];

  return (
    <div className="space-y-4">

      {isPlansLoading ? (
        <ListSkeleton />
      ) : isPlansError ? (
        <RequestError refetch={refetchPlans} message="Erro ao carregar planos Mindgest." />
      ) : (
        <GenericTable<PartnerProgramPlan>
          data={plans || []}
          columns={planColumns}
          emptyTitle="Nenhum plano disponível"
          emptyDescription="No momento não existem planos Mindgest ativos para promoção."
          emptyIcon="FileText"
        />
      )}
    </div>
  );
}

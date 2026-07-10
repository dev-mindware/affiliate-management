"use client";

import { useDashboardKPIs, usePartnerProgramPlans, useServices } from "@/hooks/affiliate";
import {
  Badge,
  Column,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui";
import { PartnerProgramPlan, Service } from "@workspace/types/affiliate";
import { formatCurrency } from "@workspace/utils";

export function ServiceListPublic() {
  const {
    data: services,
    isLoading: isServicesLoading,
    isError: isServicesError,
    refetch: refetchServices,
    page,
    total,
    totalPages,
    setPage,
    goToNextPage,
    goToPreviousPage,
  } = useServices();

  const {
    data: plans,
    isLoading: isPlansLoading,
    isError: isPlansError,
    refetch: refetchPlans,
  } = usePartnerProgramPlans();

  const { data: kpis } = useDashboardKPIs();
  const isCertified = kpis?.partner_program?.certification_status === "approved";

  const serviceColumns: Column<Service>[] = [
    {
      key: "nome",
      header: "Serviço",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.nome}</span>
          {item.descricao && <span className="line-clamp-1 text-xs text-muted-foreground">{item.descricao}</span>}
        </div>
      ),
    },
    {
      key: "preco",
      header: "Preço",
      render: (_, item) => <div className="text-sm text-foreground">{formatCurrency(item.preco)}</div>,
    },
    {
      key: "comissao",
      header: "Comissão",
      render: (_, item) => (
        <div className="text-sm font-semibold text-primary">{formatCurrency(item.comissao)}</div>
      ),
    },
    {
      key: "ativo",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.ativo ? "active" : "inactive"} />,
    },
  ];

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
    <Tabs defaultValue="services" className="space-y-6">
      <TabsList>
        <TabsTrigger value="services">Serviços</TabsTrigger>
        <TabsTrigger value="plans">Planos Mindgest</TabsTrigger>
      </TabsList>

      <TabsContent value="services" className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Serviços</h2>
          <p className="text-sm text-muted-foreground">
            Catálogo de serviços disponíveis para indicação de leads.
          </p>
        </div>

        {isServicesLoading ? (
          <ListSkeleton />
        ) : isServicesError ? (
          <RequestError refetch={refetchServices} message="Erro ao carregar serviços." />
        ) : (
          <GenericTable<Service>
            data={services || []}
            columns={serviceColumns}
            page={page}
            total={total}
            totalPages={totalPages}
            setPage={setPage}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
            emptyTitle="Nenhum serviço disponível"
            emptyDescription="No momento não existem serviços ativos para promoção."
            emptyIcon="Briefcase"
          />
        )}
      </TabsContent>

      <TabsContent value="plans" className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Planos Mindgest</h2>
          <p className="text-sm text-muted-foreground">
            Catálogo do Mindgest Partners Program com comissões por pagamento.
          </p>
        </div>

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
      </TabsContent>
    </Tabs>
  );
}

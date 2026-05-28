import { PageWrapper } from "@/components";
import { CommissionList } from "@/components/affiliate/commissions/commission-list";
import { Suspense } from "react";

export default function CommissionsPage() {
  return (
    <PageWrapper subRoute="Minhas Comissões">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Comissões</h2>
            <p className="text-muted-foreground">
              Acompanhe o status das suas comissões por vendas realizadas.
            </p>
          </div>
        </div>

        <Suspense fallback={<div>Carregando comissões...</div>}>
          <CommissionList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

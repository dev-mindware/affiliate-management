import { PageWrapper, TitleList } from "@/components";
import { CommissionList } from "@/components/affiliate/commissions/commission-list";
import { Suspense } from "react";

export default function CommissionsPage() {
  return (
    <PageWrapper subRoute="Minhas Comissões">
      <div className="space-y-6">
        <TitleList
          title="Comissões"
          suTitle="Acompanhe o status das suas comissões por vendas realizadas."
        />

        <Suspense fallback={<div>Carregando comissões...</div>}>
          <CommissionList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

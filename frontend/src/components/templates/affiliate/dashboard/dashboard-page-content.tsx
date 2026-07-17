import { TitleList } from "@workspace/ui";
import { DashboardContent } from "@/components/affiliate/dashboard/dashboard-content";

type DashboardPageContentProps = {
  mindgestAppUrl: string;
};

export function DashboardPageContent({ mindgestAppUrl }: DashboardPageContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Dashboard"
        suTitle="Acompanhe clientes, comissões, carteira e progresso no Mindgest Partners Program."
      />
      <DashboardContent mindgestAppUrl={mindgestAppUrl} />
    </div>
  );
}

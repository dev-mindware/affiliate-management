import { TitleList } from "@workspace/ui";
import { DashboardContent } from "@/components/affiliate/dashboard/dashboard-content";

export function DashboardPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Dashboard"
        suTitle="Acompanhe clientes, comissoes, carteira e progresso no Mindgest Partners Program."
      />
      <DashboardContent />
    </div>
  );
}

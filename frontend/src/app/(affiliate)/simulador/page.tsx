import { PageWrapper } from "@/components";
import { CommissionSimulatorContent } from "@/components/affiliate/simulator/commission-simulator-content";

export const metadata = {
  title: "Simulador de Comissões | Mindware Affiliate",
  description: "Calcule os seus ganhos futuros, níveis e bónus com base no desempenho da sua carteira.",
};

export default function SimuladorPage() {
  return (
    <PageWrapper subRoute="Simulador de Comissões">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Simulador de Comissões</h1>
        <p className="text-sm text-muted-foreground">
          Calcule os seus ganhos futuros, níveis e bónus com base no desempenho da sua carteira.
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-xs">
        <CommissionSimulatorContent />
      </div>
    </PageWrapper>
  );
}

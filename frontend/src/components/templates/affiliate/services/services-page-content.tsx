import { TitleList } from "@workspace/ui";
import { ServiceListPublic } from "@/components/affiliate/services/service-list-public";

export function ServicesPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Servicos Disponiveis"
        suTitle="Consulte os planos Mindgest e as comissoes previstas para cada tipo de pagamento."
      />
      <ServiceListPublic />
    </div>
  );
}

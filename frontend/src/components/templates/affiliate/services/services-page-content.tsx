import { TitleList } from "@workspace/ui";
import { ServiceListPublic } from "@/components/affiliate/services/service-list-public";

export function ServicesPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Serviços Disponíveis"
        suTitle="Descubra os planos Mindgest e as comissões que pode ganhar ao recomendá-los."
      />
      <ServiceListPublic />
    </div>
  );
}

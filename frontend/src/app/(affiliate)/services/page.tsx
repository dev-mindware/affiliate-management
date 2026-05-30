import { PageWrapper, ServicesPageContent } from "@/components";
import { Suspense } from "react";

export default function ServicesPage() {
  return (
    <PageWrapper subRoute="Serviços">
      <Suspense fallback={<div>Carregando servicos...</div>}>
        <ServicesPageContent />
      </Suspense> 
    </PageWrapper>
  );
}

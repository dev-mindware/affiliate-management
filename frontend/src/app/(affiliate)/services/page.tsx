import { PageWrapper, ServicesPageContent } from "@/components";
import { Suspense } from "react";

export default function ServicesPage() {
  return (
    <PageWrapper subRoute="Servicos">
      <Suspense fallback={<div>Carregando servicos...</div>}>
        <ServicesPageContent />
      </Suspense>
    </PageWrapper>
  );
}

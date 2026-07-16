import { PageWrapper, ServicesPageContent } from "@/components";
import { Suspense } from "react";

export default function ServicesPage() {
  return (
    <PageWrapper subRoute="Planos">
      <Suspense fallback={<div>Carregando planos...</div>}>
        <ServicesPageContent />
      </Suspense> 
    </PageWrapper>
  );
}

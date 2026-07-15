import { TitleList, PageWrapper } from "@/components";
import { AboutContent } from "@/components/affiliate/about/about-content";

export default function SobrePage() {
  return (
    <PageWrapper subRoute="Sobre o Programa">
      <div className="space-y-6">
        <TitleList
          title="Sobre o Mindgest Partners Program"
          suTitle="Entenda como funcionam os níveis, comissões e a sua carteira."
        />
        <AboutContent />
      </div>
    </PageWrapper>
  );
}

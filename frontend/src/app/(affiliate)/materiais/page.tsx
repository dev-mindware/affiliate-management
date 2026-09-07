import { MaterialsContent, PageWrapper, TitleList } from "@/components";

export default function MateriaisPage() {
  return (
    <PageWrapper subRoute="Materiais de Apoio">
      <div className="space-y-6">
        <TitleList
          title="Materiais de Apoio & Divulgação"
          suTitle="Banners oficiais, artes promocionais e textos comerciais para impulsionar as suas indicações do Mindgest."
        />
        <MaterialsContent />
      </div>
    </PageWrapper>
  );
}

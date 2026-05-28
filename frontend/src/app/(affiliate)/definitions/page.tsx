import { PageWrapper } from "@/components";
import { SettingsContent } from "@/components/affiliate";
import { Suspense } from "react";

export const metadata = {
  title: "Configurações | Mindware Affiliate",
  description: "Gerencie suas informações pessoais e de aparência.",
};

export default function SettingsPage() {
  return (
    <PageWrapper subRoute="Configurações">
      <Suspense fallback={<div>Carregando configurações...</div>}>
        <SettingsContent />
      </Suspense>
    </PageWrapper>
  );
}

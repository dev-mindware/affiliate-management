import { PageWrapper, DashboardContent } from "@/components";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard | Mindware Affiliate",
  description: "Visão geral da sua performance de afiliado.",
};

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard">
      <Suspense fallback={<div>Carregando dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </PageWrapper>
  );
}

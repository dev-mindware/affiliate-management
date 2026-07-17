import { DashboardPageContent, PageWrapper } from "@/components";
import { Suspense } from "react";

export default function DashboardPage() {
  const mindgestAppUrl = (
    process.env.MINDGEST_APP_URL ||
    process.env.NEXT_PUBLIC_MINDGEST_APP_URL ||
    "https://mindgest.mindware.ao"
  )
    .trim()
    .replace(/^['"]|['"]$/g, "");

  return (
    <PageWrapper subRoute="Dashboard">
      <Suspense fallback={<div>Carregando dashboard...</div>}>
        <DashboardPageContent mindgestAppUrl={mindgestAppUrl} />
      </Suspense>
    </PageWrapper>
  );
}

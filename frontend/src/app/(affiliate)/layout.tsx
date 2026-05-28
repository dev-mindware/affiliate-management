import { AppSidebar, BreadcrumbProvider, SidebarInset } from "@/components";
import { AffiliateModalProvider } from "@/components/affiliate";
import { RouteProtector } from "@/contexts/route-protector";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtector allowed={["affiliate", "admin"]}>
      <AffiliateModalProvider />
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </SidebarInset>
    </RouteProtector>
  );
}

"use client";

import * as React from "react";
import { GlobalSidebar } from "@workspace/ui";
import { affiliateMenuItems } from "@/constants/menu-items";

import { useAuthStore } from "@/stores/auth/auth-store";
import { logoutAction } from "@/actions/logout";
import { useModalStore } from "@workspace/hooks";
import { Icon, Button } from "@workspace/ui";

export function AppSidebar(props: Partial<React.ComponentProps<typeof GlobalSidebar>>) {
  const { user, setUser } = useAuthStore();
  const { openModal } = useModalStore();

  const handleLogout = async () => {
    setUser(null);
    await logoutAction();
  };

  const userData = {
    name: (user as any)?.nome_completo || user?.email || "Afiliado Mindware",
    email: user?.email || "affiliate@mindware.ao",
    avatar: "",
  };

  const teams = [
    {
      name: "Mindware Affiliate",
      logo: "Building2",
      plan: "Affiliate System",
    },
  ];

  // Mapeia os itens seguindo o padrão do Mindgest para o GlobalSidebar
  const navMain = affiliateMenuItems.items.map(item => ({
    title: item.name,
    url: item.url,
    icon: (props: any) => item.icon,
    items: item.items?.map(sub => ({ title: sub.name, url: sub.url }))
  }));

  return (
    <GlobalSidebar
      user={userData}
      teams={teams}
      navMain={navMain}
      onLogout={handleLogout}
      headerActions={
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-8"
          onClick={() => openModal("view-ranking")}
          title="Ver Ranking"
        >
          <Icon name="Trophy" className="size-4 text-yellow-500" />
        </Button>
      }
      {...props}
    />
  );
}

"use client";

import { PageWrapper, Button } from "@/components";
import { LeadList } from "@/components/affiliate/leads/lead-list";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { useModalStore } from "@workspace/hooks";

export default function LeadsPage() {
  const { openModal } = useModalStore();

  return (
    <PageWrapper subRoute="Meus Leads">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
            <p className="text-muted-foreground">
              Acompanhe e gerencie os seus potenciais clientes.
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => openModal("create-lead")}
          >
            <Plus className="size-4" />
            Novo Lead
          </Button>
        </div>

        <Suspense fallback={<div>Carregando leads...</div>}>
          <LeadList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

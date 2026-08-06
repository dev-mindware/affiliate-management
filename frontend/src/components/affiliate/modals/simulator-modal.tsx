"use client";

import { GlobalModal, Button } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { CommissionSimulatorContent } from "@/components/affiliate/simulator/commission-simulator-content";

export function SimulatorModal() {
  const { closeModal } = useModalStore();

  return (
    <GlobalModal
      id="commission-simulator"
      title="Simulador de Comissões"
      description="Calcule os seus ganhos futuros, níveis e bónus com base no desempenho da sua carteira."
      className="sm:max-w-[750px]"
    >
      <CommissionSimulatorContent compact />

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={() => closeModal("commission-simulator")}>
          Fechar
        </Button>
      </div>
    </GlobalModal>
  );
}

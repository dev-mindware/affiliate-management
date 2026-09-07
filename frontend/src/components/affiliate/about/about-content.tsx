"use client";

import { useDashboardKPIs } from "@/hooks/affiliate";
import { LEVELS } from "./about-constants";
import { CurrentStatusCard } from "./current-status-card";
import { LevelsGrid } from "./levels-grid";
import { MindgestFormExplainer } from "./mindgest-form-explainer";
import { CommissionAndWalletExplainers } from "./commission-wallet-explainers";
import { FaqSection } from "./faq-section";

export function AboutContent() {
  const { data: kpis } = useDashboardKPIs();
  const currentLevel = kpis?.partner_program?.partner_level ?? "none";
  const activeClients = kpis?.partner_program?.active_clients ?? 0;
  const nextLevel = kpis?.partner_program?.next_level;
  const clientsToNext = kpis?.partner_program?.clients_to_next_level ?? 0;
  const recurringBonus = kpis?.partner_program?.recurring_bonus_percent ?? 0;

  const currentLevelData = LEVELS.find((l) => l.key === currentLevel) ?? LEVELS[0];

  const progressValue = nextLevel
    ? Math.min(100, (activeClients / (activeClients + clientsToNext)) * 100)
    : 100;

  const nextLevelName = nextLevel
    ? LEVELS.find((l) => l.key === nextLevel)?.label ?? nextLevel
    : undefined;

  return (
    <div className="space-y-8">
      <CurrentStatusCard
        currentLevelData={currentLevelData}
        activeClients={activeClients}
        recurringBonus={recurringBonus}
        nextLevelName={nextLevelName}
        clientsToNext={clientsToNext}
        progressValue={progressValue}
      />

      <LevelsGrid currentLevelKey={currentLevel} />

      <MindgestFormExplainer />

      <CommissionAndWalletExplainers />

      <FaqSection />
    </div>
  );
}

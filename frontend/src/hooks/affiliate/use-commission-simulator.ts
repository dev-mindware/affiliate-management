"use client";

import { useMemo, useState } from "react";
import { usePartnerProgramPlans } from "./index";

export interface SimulatorLevel {
  name: string;
  range: string;
  minClients: number;
  base: number;
  bonus: number;
  total: number;
  next: string | null;
  color: string;
}

export const SIMULATOR_LEVELS: SimulatorLevel[] = [
  {
    name: "Base",
    range: "0–14",
    minClients: 0,
    base: 15,
    bonus: 0,
    total: 15,
    next: "Prata",
    color: "bg-muted text-muted-foreground",
  },
  {
    name: "Prata",
    range: "15–39",
    minClients: 15,
    base: 18,
    bonus: 2,
    total: 20,
    next: "Ouro",
    color: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  {
    name: "Ouro",
    range: "40–99",
    minClients: 40,
    base: 22,
    bonus: 5,
    total: 27,
    next: "Platina",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    name: "Platina",
    range: "100–249",
    minClients: 100,
    base: 26,
    bonus: 7,
    total: 33,
    next: "Elite",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  },
  {
    name: "Elite",
    range: "250+",
    minClients: 250,
    base: 28,
    bonus: 10,
    total: 38,
    next: null,
    color: "bg-primary/10 text-primary border border-primary/20",
  },
];

export function useCommissionSimulator() {
  const { data: plans } = usePartnerProgramPlans();

  const [clientsInput, setClientsInput] = useState("10");
  const [selectedPrice, setSelectedPrice] = useState("11998.22");
  const [churnInput, setChurnInput] = useState("0");
  const [antiquityInput, setAntiquityInput] = useState("12");

  const clients = Math.max(0, parseInt(clientsInput) || 0);
  const arpu = Math.max(0, parseFloat(selectedPrice) || 0);
  const churn = Math.max(0, parseFloat(churnInput) || 0);
  const antiquity = Math.max(0, parseInt(antiquityInput) || 0);

  const simulation = useMemo(() => {
    const currentLvl =
      [...SIMULATOR_LEVELS].reverse().find((lvl) => clients >= lvl.minClients) ||
      SIMULATOR_LEVELS[0];
    const baseRate = currentLvl.base;
    const levelBonus = currentLvl.bonus;

    let retentionModifier = 0;
    let retentionLabel = "Sem modificador";
    if (churn < 2) {
      retentionModifier = 2;
      retentionLabel = "Excelente Retenção (+2% bónus)";
    } else if (churn < 5) {
      retentionModifier = 1;
      retentionLabel = "Boa Retenção (+1% bónus)";
    } else if (churn > 15) {
      retentionModifier = -levelBonus;
      retentionLabel = "Churn Elevado (Bónus de Nível Suspenso)";
    }

    const rampUpBonus = antiquity <= 12 ? 3 : 0;
    const rampUpLabel =
      antiquity <= 12 ? "Incentivo Aquisição (+3%)" : "Sem bónus de ramp-up";
    const effectiveRate =
      baseRate + levelBonus + retentionModifier + rampUpBonus;
    const monthlyCommission = clients * arpu * (effectiveRate / 100);
    const annualCommission = monthlyCommission * 12;

    const nextLvl = SIMULATOR_LEVELS.find((lvl) => lvl.name === currentLvl.next);
    const missingClients = nextLvl ? nextLvl.minClients - clients : 0;

    let nextLvlEffectiveRate = 0;
    let additionalGain = 0;
    let nextLvlMonthlyCommission = 0;

    if (nextLvl) {
      let nextRetentionModifier = 0;
      if (churn < 2) nextRetentionModifier = 2;
      else if (churn < 5) nextRetentionModifier = 1;
      else if (churn > 15) nextRetentionModifier = -nextLvl.bonus;

      nextLvlEffectiveRate =
        nextLvl.base + nextLvl.bonus + nextRetentionModifier + rampUpBonus;
      nextLvlMonthlyCommission =
        nextLvl.minClients * arpu * (nextLvlEffectiveRate / 100);
      additionalGain = nextLvlMonthlyCommission - monthlyCommission;
    }

    const progressPercent = nextLvl
      ? Math.min(100, (clients / nextLvl.minClients) * 100)
      : 100;

    return {
      currentLvl,
      baseRate,
      levelBonus,
      retentionModifier,
      retentionLabel,
      rampUpBonus,
      rampUpLabel,
      effectiveRate,
      monthlyCommission,
      annualCommission,
      nextLvl,
      missingClients,
      nextLvlEffectiveRate,
      nextLvlMonthlyCommission,
      additionalGain,
      progressPercent,
    };
  }, [clients, arpu, churn, antiquity]);

  return {
    plans,
    clientsInput,
    setClientsInput,
    selectedPrice,
    setSelectedPrice,
    churnInput,
    setChurnInput,
    antiquityInput,
    setAntiquityInput,
    arpu,
    ...simulation,
  };
}

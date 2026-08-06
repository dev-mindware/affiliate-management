"use client";

import React, { useState } from "react";
import {
  Input,
  Button,
  Field,
  FieldLabel,
  FieldContent,
  Badge,
  Progress,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";
import { usePartnerProgramPlans } from "@/hooks/affiliate";

// ─── Tabela de Níveis ──────────────────────────────────────────────────────
const levels = [
  { name: "Base", range: "0–14", minClients: 0, base: 15, bonus: 0, total: 15, next: "Prata", color: "bg-muted text-muted-foreground" },
  { name: "Prata", range: "15–39", minClients: 15, base: 18, bonus: 2, total: 20, next: "Ouro", color: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
  { name: "Ouro", range: "40–99", minClients: 40, base: 22, bonus: 5, total: 27, next: "Platina", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { name: "Platina", range: "100–249", minClients: 100, base: 26, bonus: 7, total: 33, next: "Elite", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
  { name: "Elite", range: "250+", minClients: 250, base: 28, bonus: 10, total: 38, next: null, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
];

interface CommissionSimulatorContentProps {
  /** Renders in compact mode (inside a modal) */
  compact?: boolean;
}

export function CommissionSimulatorContent({ compact = false }: CommissionSimulatorContentProps) {
  const { data: plans } = usePartnerProgramPlans();

  const [clientsInput, setClientsInput] = useState("10");
  const [selectedPrice, setSelectedPrice] = useState("11998.22");
  const [churnInput, setChurnInput] = useState("0");
  const [antiquityInput, setAntiquityInput] = useState("12");

  const clients = Math.max(0, parseInt(clientsInput) || 0);
  const arpu = Math.max(0, parseFloat(selectedPrice) || 0);
  const churn = Math.max(0, parseFloat(churnInput) || 0);
  const antiquity = Math.max(0, parseInt(antiquityInput) || 0);

  const currentLvl = [...levels].reverse().find((lvl) => clients >= lvl.minClients) || levels[0];
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
  const rampUpLabel = antiquity <= 12 ? "Incentivo Aquisição (+3%)" : "Sem bónus de ramp-up";
  const effectiveRate = baseRate + levelBonus + retentionModifier + rampUpBonus;
  const monthlyCommission = clients * arpu * (effectiveRate / 100);
  const annualCommission = monthlyCommission * 12;

  const nextLvl = levels.find((lvl) => lvl.name === currentLvl.next);
  const missingClients = nextLvl ? nextLvl.minClients - clients : 0;

  let nextLvlEffectiveRate = 0;
  let additionalGain = 0;
  let nextLvlMonthlyCommission = 0;

  if (nextLvl) {
    let nextRetentionModifier = 0;
    if (churn < 2) nextRetentionModifier = 2;
    else if (churn < 5) nextRetentionModifier = 1;
    else if (churn > 15) nextRetentionModifier = -nextLvl.bonus;

    nextLvlEffectiveRate = nextLvl.base + nextLvl.bonus + nextRetentionModifier + rampUpBonus;
    nextLvlMonthlyCommission = nextLvl.minClients * arpu * (nextLvlEffectiveRate / 100);
    additionalGain = nextLvlMonthlyCommission - monthlyCommission;
  }

  const progressPercent = nextLvl ? Math.min(100, (clients / nextLvl.minClients) * 100) : 100;

  return (
    <div className={`grid grid-cols-1 ${compact ? "md:grid-cols-2 gap-6" : "sm:grid-cols-2 gap-6 lg:gap-10"}`}>
      {/* Painel de Inputs */}
      <div className={`space-y-4 ${compact ? "pr-0 md:pr-4 md:border-r border-border" : "pr-0 sm:pr-6 sm:border-r border-border"}`}>
        <p className="text-sm font-semibold text-foreground">Parâmetros da Carteira</p>

        <Field>
          <FieldLabel htmlFor="sim-clients">N.º de Clientes Ativos</FieldLabel>
          <FieldContent>
            <Input
              id="sim-clients"
              type="number"
              min="0"
              value={clientsInput}
              onChange={(e) => setClientsInput(e.target.value)}
              placeholder="Ex: 20"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Apenas subscrições ativas e pagas.</p>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="sim-arpu">Plano Selecionado</FieldLabel>
          <FieldContent>
            <Select value={selectedPrice} onValueChange={(val) => setSelectedPrice(val)}>
              <SelectTrigger id="sim-arpu">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((p, idx) => (
                  <SelectItem key={`plan-${idx}`} value={p.price.toString()}>
                    {p.name} - {formatCurrency(Number(p.price))}
                  </SelectItem>
                )) || (
                  <>
                    <SelectItem value="5445.22">BASE - 5.445,22 Kz</SelectItem>
                    <SelectItem value="11998.22">SMART - 11.998,22 Kz</SelectItem>
                    <SelectItem value="14899.22">PRO - 14.899,22 Kz</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Preço associado que define a receita base por cliente: {formatCurrency(arpu)}
            </p>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="sim-churn">Taxa de Churn Anual (%)</FieldLabel>
          <FieldContent>
            <Input
              id="sim-churn"
              type="number"
              min="0"
              max="100"
              value={churnInput}
              onChange={(e) => setChurnInput(e.target.value)}
              placeholder="Ex: 3"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Percentagem de cancelamentos nos últimos 12 meses.
            </p>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="sim-antiquity">Antiguidade Média (Meses)</FieldLabel>
          <FieldContent>
            <Input
              id="sim-antiquity"
              type="number"
              min="0"
              value={antiquityInput}
              onChange={(e) => setAntiquityInput(e.target.value)}
              placeholder="Ex: 10"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Tempo médio de fidelização dos clientes na plataforma.
            </p>
          </FieldContent>
        </Field>
      </div>

      {/* Painel de Resultados */}
      <div className="space-y-5">
        <p className="text-sm font-semibold text-foreground">Resultados Estimados</p>

        {/* Nível Atual Card */}
        <div className="rounded-xl border p-4 bg-muted/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">Nível Alcançado</span>
            <Badge className={currentLvl.color}>{currentLvl.name}</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Taxa Efetiva:</span>
            <span className="text-lg font-semibold text-primary">{effectiveRate}%</span>
          </div>
          <div className="text-[10px] text-muted-foreground space-y-1 pt-1 border-t border-border/60">
            <div className="flex justify-between">
              <span>Comissão Base do Nível:</span>
              <span>{baseRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Bónus do Nível:</span>
              <span>+{levelBonus}%</span>
            </div>
            {retentionModifier !== 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Modificador Retenção:</span>
                <span>{retentionModifier > 0 ? `+${retentionModifier}` : retentionModifier}%</span>
              </div>
            )}
            {rampUpBonus > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Bónus Ramp-Up:</span>
                <span>+{rampUpBonus}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Ganhos Estimados */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3 bg-card">
            <p className="text-[10px] text-muted-foreground uppercase">Comissão Mensal</p>
            <p className="text-base font-semibold text-foreground mt-1">{formatCurrency(monthlyCommission)}</p>
          </div>
          <div className="rounded-xl border p-3 bg-card">
            <p className="text-[10px] text-muted-foreground uppercase">Projeção Anual</p>
            <p className="text-base font-semibold text-foreground mt-1">{formatCurrency(annualCommission)}</p>
          </div>
        </div>

        {/* Modificadores info */}
        <div className="text-xs space-y-1.5 p-3 rounded-xl border border-border/80 bg-card">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status Qualidade (Churn):</span>
            <span className="font-semibold text-foreground text-right max-w-[55%]">{retentionLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ramp-Up (Antiguidade):</span>
            <span className="font-semibold text-foreground text-right max-w-[55%]">{rampUpLabel}</span>
          </div>
        </div>

        {/* Próximo Nível Progress */}
        {nextLvl ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Faltam {missingClients} clientes para o nível {nextLvl.name}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 border border-primary/20 mt-2">
              <p className="text-[11px] text-primary font-medium leading-relaxed">
                🚀 Ao atingir o nível {nextLvl.name} ({nextLvl.minClients} clientes), o seu rendimento mensal estimado subirá para{" "}
                <strong>{formatCurrency(nextLvlMonthlyCommission)}</strong> (um ganho adicional de +{formatCurrency(additionalGain)}/mês).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-200 dark:border-purple-900/50">
            <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold text-center">
              👑 Nível Máximo Alcançado! Parabéns, é um parceiro de Elite.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

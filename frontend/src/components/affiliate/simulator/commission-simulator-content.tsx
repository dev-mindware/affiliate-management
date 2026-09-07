"use client";

import React from "react";
import {
  Input,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Icon,
} from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";
import { useCommissionSimulator } from "@/hooks/affiliate";

interface CommissionSimulatorContentProps {
  /** Renders in compact mode (inside a modal) */
  compact?: boolean;
}

export function CommissionSimulatorContent({
  compact = false,
}: CommissionSimulatorContentProps) {
  const {
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
    nextLvlMonthlyCommission,
    additionalGain,
    progressPercent,
  } = useCommissionSimulator();

  return (
    <div
      className={`grid grid-cols-1 ${
        compact ? "md:grid-cols-2 gap-6" : "sm:grid-cols-2 gap-6 lg:gap-10"
      }`}
    >
      {/* Painel de Inputs */}
      <div
        className={`space-y-4 ${
          compact
            ? "pr-0 md:pr-4 md:border-r border-border"
            : "pr-0 sm:pr-6 sm:border-r border-border"
        }`}
      >
        <p className="text-sm font-semibold text-foreground">
          Parâmetros da Carteira
        </p>

        <Field data-tour="sim-slider">
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
            <p className="text-[10px] text-muted-foreground mt-1">
              Apenas subscrições ativas e pagas.
            </p>
          </FieldContent>
        </Field>

        <Field data-tour="sim-plans">
          <FieldLabel htmlFor="sim-arpu">Plano Selecionado</FieldLabel>
          <FieldContent>
            <Select
              value={selectedPrice}
              onValueChange={(val) => setSelectedPrice(val)}
            >
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
              Preço associado que define a receita base por cliente:{" "}
              {formatCurrency(arpu)}
            </p>
          </FieldContent>
        </Field>

        <Field data-tour="sim-churn-field">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FieldLabel htmlFor="sim-churn" className="mb-0">
              Taxa de Churn Anual (%)
            </FieldLabel>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-help"
                    aria-label="O que é a Taxa de Churn?"
                  >
                    <Icon name="Info" className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="max-w-xs space-y-1.5 p-3 text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-md"
                >
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Icon name="Info" className="size-3.5 text-primary" />
                    O que é a Taxa de Churn?
                  </p>
                  <p className="text-muted-foreground">
                    A taxa de churn (taxa de cancelamento) mede a percentagem de
                    clientes que cancelam ou deixam de renovar a subscrição do
                    Mindgest num período de 12 meses.
                  </p>
                  <div className="pt-1 border-t border-border/60 text-[11px] space-y-1">
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      • Churn &lt; 2%: Retenção de excelência (+2% bónus)
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      • Churn &lt; 5%: Boa retenção (+1% bónus)
                    </p>
                    <p className="text-muted-foreground">
                      • Churn 5%–15%: Sem modificador
                    </p>
                    <p className="text-destructive font-medium">
                      • Churn &gt; 15%: Bónus de nível suspenso
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
              Percentagem de cancelamentos nos últimos 12 meses na sua carteira.
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
        <p className="text-sm font-semibold text-foreground">
          Resultados Estimados
        </p>

        {/* Nível Atual Card */}
        <div
          data-tour="sim-immediate"
          className="rounded-xl border p-4 bg-muted/40 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase">
              Nível Alcançado
            </span>
            <Badge className={currentLvl.color}>{currentLvl.name}</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Taxa Efetiva:</span>
            <span className="text-lg font-semibold text-primary">
              {effectiveRate}%
            </span>
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
                <span>
                  {retentionModifier > 0
                    ? `+${retentionModifier}`
                    : retentionModifier}
                  %
                </span>
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
        <div data-tour="sim-recurring" className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3 bg-card">
            <p className="text-[10px] text-muted-foreground uppercase">
              Comissão Mensal
            </p>
            <p className="text-base font-semibold text-foreground mt-1">
              {formatCurrency(monthlyCommission)}
            </p>
          </div>
          <div className="rounded-xl border p-3 bg-card">
            <p className="text-[10px] text-muted-foreground uppercase">
              Projeção Anual
            </p>
            <p className="text-base font-semibold text-foreground mt-1">
              {formatCurrency(annualCommission)}
            </p>
          </div>
        </div>

        {/* Modificadores info */}
        <div className="text-xs space-y-1.5 p-3 rounded-xl border border-border/80 bg-card">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status Qualidade (Churn):</span>
            <span className="font-semibold text-foreground text-right max-w-[55%]">
              {retentionLabel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ramp-Up (Antiguidade):</span>
            <span className="font-semibold text-foreground text-right max-w-[55%]">
              {rampUpLabel}
            </span>
          </div>
        </div>

        {/* Próximo Nível Progress */}
        {nextLvl ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Faltam {missingClients} clientes para o nível {nextLvl.name}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 border border-primary/20 mt-2 flex items-start gap-2.5">
              <Icon
                name="TrendingUp"
                className="size-4 text-primary shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-primary font-medium leading-relaxed">
                Ao atingir o nível {nextLvl.name} ({nextLvl.minClients} clientes),
                o seu rendimento mensal estimado subirá para{" "}
                <strong>{formatCurrency(nextLvlMonthlyCommission)}</strong> (um
                ganho adicional de +{formatCurrency(additionalGain)}/mês).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 flex items-center justify-center gap-2">
            <Icon name="Crown" className="size-4 text-primary shrink-0" />
            <p className="text-[11px] text-primary font-semibold text-center">
              Nível Máximo Alcançado! Parabéns, é um parceiro de Elite.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

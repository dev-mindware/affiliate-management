"use client";

import { useDashboardKPIs } from "@/hooks/affiliate";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
} from "@workspace/ui";

// ─── Level data ────────────────────────────────────────────────────────────
const levels = [
  {
    key: "none",
    label: "Base",
    sublabel: "None",
    range: "< 15 clientes",
    firstPayment: "20%",
    bonus: "0%",
    total: "15%",
    rationale: "Mantém-se — alinhado com entrada de mercado",
    colorClass: "bg-muted text-muted-foreground",
    accentClass: "border-muted",
    icon: "⚪",
  },
  {
    key: "silver",
    label: "Prata",
    sublabel: "Silver",
    range: "15 – 39 clientes",
    firstPayment: "20%",
    bonus: "+5%",
    total: "20%",
    rationale: 'Ligeira subida inicial — evita esgotar a margem cedo',
    colorClass: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    accentClass: "border-slate-400",
    icon: "🥈",
  },
  {
    key: "gold",
    label: "Ouro",
    sublabel: "Gold",
    range: "40 – 99 clientes",
    firstPayment: "20%",
    bonus: "+12%",
    total: "27%",
    rationale: "Salto real face à Prata, ainda com margem para o próximo nível",
    colorClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    accentClass: "border-yellow-400",
    icon: "🥇",
  },
  {
    key: "platinum",
    label: "Platina",
    sublabel: "Platinum",
    range: "100 – 249 clientes",
    firstPayment: "20%",
    bonus: "+18%",
    total: "33%",
    rationale: "Novo nível estratégico — cobre o intervalo entre Ouro e Elite",
    colorClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    accentClass: "border-cyan-400",
    icon: "💎",
  },
  {
    key: "elite",
    label: "Elite",
    sublabel: "Elite",
    range: "250+ clientes",
    firstPayment: "20%",
    bonus: "+23%",
    total: "38%",
    rationale: "Reservado para os parceiros verdadeiramente estratégicos",
    colorClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    accentClass: "border-purple-400",
    icon: "👑",
  },
];

function LevelCard({
  level,
  isCurrent,
}: {
  level: (typeof levels)[0];
  isCurrent: boolean;
}) {
  return (
    <Card
      className={`relative transition-all ${
        isCurrent
          ? `${level.accentClass} border-2 ring-2 ring-offset-2 ring-offset-background ring-primary/30`
          : ""
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground shadow">
          Seu Nível Atual
        </span>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-2xl">{level.icon}</span>
            <CardTitle className="mt-1 text-base">{level.label}</CardTitle>
            <CardDescription className="text-xs">
              {level.sublabel} · {level.range}
            </CardDescription>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-semibold ${level.colorClass}`}
          >
            {level.total}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        <Separator />
        <div className="flex justify-between pt-1 text-sm">
          <span className="text-muted-foreground">1.º Pagamento</span>
          <span className="font-semibold text-foreground">{level.firstPayment}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Bónus de nível</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {level.bonus}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Comissão recorrente</span>
          <span className="font-semibold text-primary">{level.total}</span>
        </div>
        <Separator />
        <p className="pt-1 text-xs italic text-muted-foreground">{level.rationale}</p>
      </CardContent>
    </Card>
  );
}

const faqs = [
  {
    q: "O meu nível desce se perder clientes?",
    a: "Sim. O número de clientes ativos é recalculado periodicamente. Se ficar abaixo do limiar do seu nível atual, a comissão ajusta-se no processamento seguinte.",
  },
  {
    q: "Os clientes anuais contam para o meu nível?",
    a: "Sim, qualquer subscrição ativa (mensal ou anual) atribuída ao seu perfil conta para o total de clientes ativos.",
  },
  {
    q: "Posso promover todos os planos do Mindgest?",
    a: "Os planos BASE e SMART estão disponíveis para todos os afiliados. O plano PRO requer Certificação Comercial aprovada pela equipa Mindware.",
  },
  {
    q: "Quanto tempo demora um levantamento?",
    a: "Após submeter o pedido, a equipa financeira processa a transferência e associa o comprovativo ao seu painel. O tempo depende da disponibilidade bancária, geralmente 1-3 dias úteis.",
  },
];

export function AboutContent() {
  const { data: kpis } = useDashboardKPIs();
  const currentLevel = kpis?.partner_program?.partner_level ?? "none";
  const activeClients = kpis?.partner_program?.active_clients ?? 0;
  const nextLevel = kpis?.partner_program?.next_level;
  const clientsToNext = kpis?.partner_program?.clients_to_next_level ?? 0;
  const recurringBonus = kpis?.partner_program?.recurring_bonus_percent ?? 0;

  const currentLevelData = levels.find((l) => l.key === currentLevel) ?? levels[0];

  const progressValue = nextLevel
    ? Math.min(100, (activeClients / (activeClients + clientsToNext)) * 100)
    : 100;

  return (
    <div className="space-y-8">
      {/* ── Current Status ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">A Sua Posição Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentLevelData.icon}</span>
              <div>
                <p className="text-xl font-semibold text-foreground">{currentLevelData.label}</p>
                <p className="text-sm text-muted-foreground">
                  {activeClients} clientes ativos ·{" "}
                  <span className="font-semibold text-primary">
                    {15 + recurringBonus}% comissão recorrente
                  </span>
                </p>
              </div>
            </div>

            {nextLevel && (
              <div className="w-full lg:max-w-xs">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>
                    Progresso para{" "}
                    {levels.find((l) => l.key === nextLevel)?.label ?? nextLevel}
                  </span>
                  <span>{clientsToNext} em falta</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            )}

            {!nextLevel && (
              <Badge className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-1">
                👑 Nível Máximo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Levels Grid ── */}
      <section>
        <p className="mb-1 text-base font-semibold text-foreground">
          Tabela de Níveis e Comissões
        </p>
        <p className="mb-5 text-sm text-muted-foreground">
          A sua comissão recorrente sobe automaticamente à medida que acumula mais clientes ativos.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {levels.map((level) => (
            <LevelCard key={level.key} level={level} isCurrent={level.key === currentLevel} />
          ))}
        </div>
      </section>

      {/* ── Explainers ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Commissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>💰</span> Como são calculadas as comissões?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              {
                dot: "bg-primary",
                label: "Primeiro pagamento (mensal ou anual):",
                text: "Ganha sempre 20% do valor pago pelo cliente no momento da adesão.",
              },
              {
                dot: "bg-primary",
                label: "Renovações mensais:",
                text: "Ganha a percentagem recorrente do seu nível atual em cada renovação de subscrição.",
              },
              {
                dot: "bg-primary",
                label: "Upgrade automático:",
                text: "Ao atingir o número de clientes ativos necessário, o seu nível (e comissão) é atualizado automaticamente.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
                <span>
                  <span className="font-semibold text-foreground">{item.label}</span>{" "}
                  {item.text}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>🏦</span> Como funciona a Carteira?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              {
                dot: "bg-amber-500",
                label: "Saldo Pendente:",
                text: "As comissões ficam retidas por 15 dias após o pagamento do cliente (período de garantia de ativação).",
              },
              {
                dot: "bg-emerald-500",
                label: "Saldo Disponível:",
                text: "Após os 15 dias, o valor transita automaticamente para disponível, pronto para levantamento.",
              },
              {
                dot: "bg-primary",
                label: "Levantamento mínimo:",
                text: "O valor mínimo para solicitar levantamento é de 8.000 Kz.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
                <span>
                  <span className="font-semibold text-foreground">{item.label}</span>{" "}
                  {item.text}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── FAQ ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">❓ Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {faqs.map((item, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-4" />}
              <p className="font-semibold text-foreground">{item.q}</p>
              <p className="mt-1 text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

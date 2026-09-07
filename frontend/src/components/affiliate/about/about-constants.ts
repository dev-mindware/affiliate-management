import { icons } from "lucide-react";

export type LevelDefinition = {
  key: string;
  label: string;
  sublabel: string;
  range: string;
  firstPayment: string;
  bonus: string;
  total: string;
  rationale: string;
  badgeClass: string;
  borderClass: string;
  iconBgClass: string;
  iconName: keyof typeof icons;
};

export const LEVELS: LevelDefinition[] = [
  {
    key: "none",
    label: "Base",
    sublabel: "None",
    range: "< 15 clientes",
    firstPayment: "20%",
    bonus: "0%",
    total: "15%",
    rationale: "Nível inicial de entrada para novos parceiros afiliados.",
    badgeClass: "bg-muted text-muted-foreground border-border",
    borderClass: "border-border",
    iconBgClass: "bg-muted/80 text-muted-foreground border-border",
    iconName: "Shield",
  },
  {
    key: "silver",
    label: "Prata",
    sublabel: "Silver",
    range: "15 – 39 clientes",
    firstPayment: "20%",
    bonus: "+5%",
    total: "20%",
    rationale: "Primeiro patamar de escala comercial com bónus mensal recorrente.",
    badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    borderClass: "border-slate-300 dark:border-slate-700",
    iconBgClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    iconName: "Award",
  },
  {
    key: "gold",
    label: "Ouro",
    sublabel: "Gold",
    range: "40 – 99 clientes",
    firstPayment: "20%",
    bonus: "+12%",
    total: "27%",
    rationale: "Crescimento acelerado com salto substancial de rendimento recorrente.",
    badgeClass: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    borderClass: "border-amber-300 dark:border-amber-800",
    iconBgClass: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    iconName: "Trophy",
  },
  {
    key: "platinum",
    label: "Platina",
    sublabel: "Platinum",
    range: "100 – 249 clientes",
    firstPayment: "20%",
    bonus: "+18%",
    total: "33%",
    rationale: "Nível avançado para parceiros com ampla carteira corporativa ativa.",
    badgeClass: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    borderClass: "border-cyan-300 dark:border-cyan-800",
    iconBgClass: "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    iconName: "Sparkles",
  },
  {
    key: "elite",
    label: "Elite",
    sublabel: "Elite",
    range: "250+ clientes",
    firstPayment: "20%",
    bonus: "+23%",
    total: "38%",
    rationale: "Patamar máximo reservado a parceiros institucionais e estratégicos.",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    borderClass: "border-primary/40",
    iconBgClass: "bg-primary/15 text-primary border-primary/30",
    iconName: "Crown",
  },
];

export const FAQS = [
  {
    q: "O meu nível desce se perder clientes?",
    a: "Sim. O número de clientes ativos é recalculado periodicamente. Se o volume ficar abaixo do limiar do seu nível atual, a percentagem ajusta-se no processamento seguinte.",
  },
  {
    q: "Os clientes anuais contam para o meu nível?",
    a: "Sim, qualquer subscrição ativa (mensal ou anual) associada ao seu perfil conta para o total de clientes ativos da carteira.",
  },
  {
    q: "Posso promover todos os planos do Mindgest?",
    a: "Os planos BASE e SMART estão disponíveis para todos os afiliados. O plano PRO requer Certificação Comercial aprovada pela equipa Mindware.",
  },
  {
    q: "Quanto tempo demora um levantamento?",
    a: "Após submeter o pedido, a equipa financeira processa a transferência bancária e anexa o comprovativo oficial ao painel. O prazo regular é de 24h a 48h úteis.",
  },
];

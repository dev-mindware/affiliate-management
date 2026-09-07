"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth/auth-store";
import {
  useProfile,
  useUpdateProfile,
  useOnboarding,
  useUpdateOnboardingPreferences,
  useResetAllOnboardingTours,
  useResetOnboardingTour,
} from "@/hooks/affiliate";
import {
  Button,
  Input,
  Field,
  FieldLabel,
  FieldContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Skeleton,
  Icon,
  Appearance,
  Switch,
  Badge,
} from "@workspace/ui";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@workspace/utils";
import {
  ONBOARDING_TOURS,
  OnboardingTourId,
} from "@/constants/onboarding-tours";

type SectionKey = "profile" | "appearance" | "tours";

const NAV_SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "profile", label: "Perfil", icon: "User" },
  { key: "appearance", label: "Aparência", icon: "Pencil" },
  { key: "tours", label: "Guias & Ajuda", icon: "CircleHelp" },
];

const AVAILABLE_TOURS_LIST: {
  id: OnboardingTourId;
  title: string;
  stepCount: number;
  description: string;
  href: string;
  icon: string;
}[] = [
  {
    id: "dashboard",
    title: "Painel Geral",
    stepCount: ONBOARDING_TOURS.dashboard.steps.length,
    description: "Métricas de ganhos, comissões pendentes, escalões de parceiro e link de indicação.",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    id: "wallet",
    title: "Carteira & Levantamentos",
    stepCount: ONBOARDING_TOURS.wallet.steps.length,
    description: "Gestão do saldo disponível, retenção de 7 dias, limite mínimo de 5.000 Kz e conformidade AGT.",
    href: "/wallet",
    icon: "Wallet",
  },
  {
    id: "materiais",
    title: "Materiais Promocionais",
    stepCount: ONBOARDING_TOURS.materiais.steps.length,
    description: "Download em lote (.ZIP), artes para redes sociais, copies de alta conversão e dicas de prospecção.",
    href: "/materiais",
    icon: "FolderDown",
  },
  {
    id: "clientes",
    title: "Gestão de Clientes",
    stepCount: ONBOARDING_TOURS.clientes.steps.length,
    description: "Acompanhamento do status de subscrição, ciclo de faturação e política anti-churn de 7 dias.",
    href: "/clientes",
    icon: "Users",
  },
  {
    id: "ranking",
    title: "Ranking de Parceiros",
    stepCount: ONBOARDING_TOURS.ranking.steps.length,
    description: "Posicionamento no top de vendas, requisitos para subida de escalão e vantagens da certificação oficial.",
    href: "/ranking",
    icon: "Trophy",
  },
  {
    id: "simulador",
    title: "Simulador de Comissões",
    stepCount: ONBOARDING_TOURS.simulador.steps.length,
    description: "Cálculo em tempo real de comissão imediata (20%) e rendimento recorrente perpétuo com planos Mindgest.",
    href: "/simulador",
    icon: "Calculator",
  },
];

export function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const activeSection: SectionKey =
    currentTab === "appearance" ? "appearance" : currentTab === "tours" ? "tours" : "profile";

  const { data: profile, isLoading } = useProfile();
  const { mutate: update, isPending } = useUpdateProfile();
  const { user } = useAuthStore();

  const { data: onboardingData, isLoading: isLoadingOnboarding } = useOnboarding();
  const { mutate: updatePreferences, isPending: isUpdatingPreferences } = useUpdateOnboardingPreferences();
  const { mutate: resetAllTours, isPending: isResettingAll } = useResetAllOnboardingTours();
  const { mutate: resetTour, isPending: isResettingTour } = useResetOnboardingTour();

  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nome_completo: profile.nome_completo || "",
        telefone: profile.telefone || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    update(formData, {
      onSuccess: () => {
        toast.success("Perfil atualizado com sucesso!");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || "Erro ao atualizar perfil.");
      },
    });
  };

  const initials = useMemo(() => {
    const name = profile?.nome_completo || user?.email || "U";
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.nome_completo, user?.email]);

  const handleSectionChange = (section: SectionKey) => {
    router.push(`?tab=${section}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        {/* Mobile skeleton tab bar */}
        <div className="flex gap-2 lg:hidden">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block rounded-2xl border bg-card p-4 space-y-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </aside>
          <main className="rounded-2xl border bg-card p-4 md:p-6 space-y-4">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-4">
      {/* ── Mobile Tab Bar ── */}
      <div className="flex lg:hidden gap-1.5 p-1 bg-muted/60 rounded-none border">
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => handleSectionChange(section.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-all duration-200",
              activeSection === section.key
                ? "bg-card text-primary shadow-sm border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon name={section.icon as any} className="h-4 w-4" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block border bg-card p-4 lg:min-h-[620px]">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gerais</p>
          <nav className="mt-4 space-y-1">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => handleSectionChange(section.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-none border-l-2 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  activeSection === section.key
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-transparent text-foreground hover:bg-muted/60 hover:text-primary"
                )}
              >
                <Icon name={section.icon as any} className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Right Content ── */}
        <main className="rounded-2xl border bg-card p-4 md:p-6">
          {activeSection === "profile" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <header className="border-b pb-4">
                <h2 className="text-xl font-bold tracking-tight">Meu Perfil</h2>
                <p className="mt-1 text-sm text-muted-foreground">Faça a gestão das suas informações pessoais e de contato.</p>
              </header>

              {/* Avatar section */}
              <section className="rounded-2xl border bg-muted/20 p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-primary/25 shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold truncate">
                      {profile?.nome_completo || "Afiliado Mindware"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {profile?.email || user?.email || "-"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Personal Data Form */}
              <section className="rounded-2xl border bg-muted/10 p-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Informação Pessoal</h3>
                    <p className="text-sm text-muted-foreground">Atualize seu nome e dados de contato.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSave}
                    loading={isPending}
                    className="w-full sm:w-auto"
                  >
                    <Icon name="Save" className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Nome Completo</FieldLabel>
                    <FieldContent>
                      <Input
                        value={formData.nome_completo}
                        onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Telefone</FieldLabel>
                    <FieldContent>
                      <Input
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </FieldContent>
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel>E-mail</FieldLabel>
                    <FieldContent>
                      <Input value={profile?.email || user?.email || ""} disabled />
                    </FieldContent>
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel>Código de Afiliado</FieldLabel>
                    <FieldContent>
                      <div className="flex gap-2">
                        <Input
                          value={profile?.codigo_afiliado || ""}
                          disabled
                          className="font-mono font-bold text-primary flex-1"
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            if (profile?.codigo_afiliado) {
                              navigator.clipboard.writeText(profile.codigo_afiliado);
                              toast.success("Código de afiliado copiado com sucesso!");
                            }
                          }}
                          className="shrink-0"
                        >
                          <Icon name="Copy" className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Copiar</span>
                        </Button>
                      </div>
                    </FieldContent>
                  </Field>
                </div>
              </section>

              {/* Security Password Form */}
              <section className="rounded-2xl border bg-muted/10 p-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Segurança</h3>
                    <p className="text-sm text-muted-foreground">Alterar sua senha de acesso.</p>
                  </div>
                  <Button variant="outline" type="button" className="w-full sm:w-auto">
                    Alterar Senha
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Nova Senha</FieldLabel>
                    <FieldContent>
                      <Input type="password" placeholder="••••••••" />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Confirmar Nova Senha</FieldLabel>
                    <FieldContent>
                      <Input type="password" placeholder="••••••••" />
                    </FieldContent>
                  </Field>
                </div>
              </section>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <header className="border-b pb-4">
                <h2 className="text-xl font-bold tracking-tight">Aparência</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ajuste a identidade visual da sua experiência.</p>
              </header>
              <Appearance />
            </div>
          )}

          {activeSection === "tours" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <header className="border-b pb-4">
                <h2 className="text-xl font-bold tracking-tight">Guias Interativos & Integração</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Personalize a experiência de onboarding guiado e reveja o funcionamento de cada módulo da plataforma.
                </p>
              </header>

              {/* Preferences Section */}
              <section className="rounded-2xl border bg-muted/10 p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Preferências de Visualização</h3>
                  <p className="text-sm text-muted-foreground">
                    Estas definições são sincronizadas na sua conta e aplicadas em qualquer dispositivo.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5 pr-4">
                      <label className="text-sm font-medium text-foreground cursor-pointer" htmlFor="toggle-autostart">
                        Inicialização Automática
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Iniciar automaticamente o guia explicativo na primeira vez que visitar cada página.
                      </p>
                    </div>
                    <Switch
                      id="toggle-autostart"
                      checked={onboardingData?.preferences?.autoStartEnabled ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferences(
                          { autoStartEnabled: checked },
                          {
                            onSuccess: () => toast.success("Preferência atualizada com sucesso!"),
                            onError: () => toast.error("Erro ao atualizar preferência."),
                          }
                        )
                      }
                      disabled={isUpdatingPreferences || isLoadingOnboarding}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5 pr-4">
                      <label className="text-sm font-medium text-foreground cursor-pointer" htmlFor="toggle-tourbutton">
                        Botão &ldquo;Ver guia&rdquo; nos cabeçalhos
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Exibir o botão de ajuda interativa no topo de cada página para consulta rápida.
                      </p>
                    </div>
                    <Switch
                      id="toggle-tourbutton"
                      checked={onboardingData?.preferences?.tourButtonEnabled ?? true}
                      onCheckedChange={(checked) =>
                        updatePreferences(
                          { tourButtonEnabled: checked },
                          {
                            onSuccess: () => toast.success("Preferência atualizada com sucesso!"),
                            onError: () => toast.error("Erro ao atualizar preferência."),
                          }
                        )
                      }
                      disabled={isUpdatingPreferences || isLoadingOnboarding}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium">Reiniciar Todos os Guias</h4>
                    <p className="text-xs text-muted-foreground">
                      Remove o histórico de conclusão de todos os 6 guias para permitir repeti-los.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={isResettingAll}
                    onClick={() =>
                      resetAllTours(undefined, {
                        onSuccess: () => toast.success("Todos os guias foram reiniciados!"),
                        onError: () => toast.error("Erro ao reiniciar os guias."),
                      })
                    }
                  >
                    <Icon name="RotateCcw" className="h-4 w-4 mr-2" />
                    Repor Todos
                  </Button>
                </div>
              </section>

              {/* Tours List */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Módulos Guiados Disponíveis</h3>
                    <p className="text-sm text-muted-foreground">
                      Aceda diretamente a qualquer página ou reinicie o guia individual correspondente.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {AVAILABLE_TOURS_LIST.map((tourItem) => {
                    const progress = onboardingData?.tours?.[tourItem.id];
                    const statusStr = progress?.status?.toLowerCase();
                    const isCompleted = statusStr === "completed";
                    const isSkipped = statusStr === "skipped";

                    return (
                      <div
                        key={tourItem.id}
                        className="rounded-2xl border bg-card p-4 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Icon name={tourItem.icon as any} className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">{tourItem.title}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {tourItem.stepCount} passos detalhados
                                </span>
                              </div>
                            </div>
                            {isCompleted ? (
                              <Badge variant="success" className="gap-1">
                                <Icon name="CheckCheck" className="h-3 w-3" />
                                Concluído
                              </Badge>
                            ) : isSkipped ? (
                              <Badge variant="pending" className="gap-1">
                                <Icon name="CircleX" className="h-3 w-3" />
                                Ignorado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-muted-foreground">
                                <Icon name="Clock" className="h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {tourItem.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            disabled={isResettingTour}
                            onClick={() =>
                              resetTour(tourItem.id, {
                                onSuccess: () =>
                                  toast.success(`Guia de "${tourItem.title}" reiniciado!`),
                                onError: () => toast.error("Erro ao reiniciar guia."),
                              })
                            }
                          >
                            <Icon name="RotateCcw" className="h-3.5 w-3.5 mr-1.5" />
                            Repor
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                          >
                            <Link href={tourItem.href}>
                              <span>Ver Página</span>
                              <Icon name="ChevronRight" className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

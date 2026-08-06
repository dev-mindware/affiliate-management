"use client";

import { useAuthStore } from "@/stores/auth/auth-store";
import { useProfile, useUpdateProfile } from "@/hooks/affiliate";
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
} from "@workspace/ui";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@workspace/utils";

type SectionKey = "profile" | "appearance";

const NAV_SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "profile", label: "Perfil", icon: "User" },
  { key: "appearance", label: "Aparência", icon: "Pencil" },
];

export function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const activeSection = currentTab === "appearance" ? "appearance" : "profile";

  const { data: profile, isLoading } = useProfile();
  const { mutate: update, isPending } = useUpdateProfile();
  const { user } = useAuthStore();

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
      {/* ── Mobile Tab Bar (pill segmented control) ── */}
      <div className="flex lg:hidden gap-1.5 p-1 bg-muted/60 rounded-2xl border">
        {NAV_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => handleSectionChange(section.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
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
        <aside className="hidden lg:block rounded-2xl border bg-card p-4 lg:min-h-[620px]">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gerais</p>
          <nav className="mt-4 space-y-1">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => handleSectionChange(section.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-l-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  activeSection === section.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60 hover:text-primary"
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
        </main>
      </div>
    </div>
  );
}

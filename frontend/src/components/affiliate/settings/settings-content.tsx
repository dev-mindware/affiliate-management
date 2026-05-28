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
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] animate-in fade-in duration-500">
        <aside className="rounded-lg border bg-card p-4 lg:min-h-[620px] space-y-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </aside>
        <main className="rounded-lg border bg-background p-4 md:p-6 space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left Sidebar */}
        <aside className="rounded-lg border bg-card p-4 lg:min-h-[620px]">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gerais</p>
          <nav className="mt-4 space-y-1">
            <button
              type="button"
              onClick={() => handleSectionChange("profile")}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
                activeSection === "profile"
                  ? "border-primary bg-primary/15 text-primary"
                  : "text-foreground hover:bg-muted/60 hover:text-primary"
              )}
            >
              <Icon name="User" className="h-4 w-4" />
              Perfil
            </button>
            <button
              type="button"
              onClick={() => handleSectionChange("appearance")}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
                activeSection === "appearance"
                  ? "border-primary bg-primary/15 text-primary"
                  : "text-foreground hover:bg-muted/60 hover:text-primary"
              )}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Aparência
            </button>
          </nav>
        </aside>

        {/* Right Content */}
        <main className="rounded-lg border bg-background p-4 md:p-6">
          {activeSection === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <header className="border-b pb-5">
                <h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
                <p className="mt-1 text-muted-foreground">Faça a gestão das suas informações pessoais e de contato.</p>
              </header>

              {/* Avatar section */}
              <section className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-primary/25">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profile?.nome_completo || "Afiliado Mindware"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.email || user?.email || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Personal Data Form */}
              <section className="rounded-lg border bg-card p-4 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Informação Pessoal</h3>
                    <p className="text-sm text-muted-foreground">Atualize seu nome e dados de contato.</p>
                  </div>
                  <Button type="button" onClick={handleSave} loading={isPending}>
                    <Icon name="Save" className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                  <Field className="md:col-span-2">
                    <FieldLabel>E-mail</FieldLabel>
                    <FieldContent>
                      <Input
                        value={profile?.email || user?.email || ""}
                        disabled
                      />
                    </FieldContent>
                  </Field>
                </div>
              </section>

              {/* Security Password Form */}
              <section className="rounded-lg border bg-card p-4 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Segurança</h3>
                    <p className="text-sm text-muted-foreground">Alterar sua senha de acesso.</p>
                  </div>
                  <Button variant="outline" type="button">
                    Alterar Senha
                  </Button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
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
            <div className="space-y-6 animate-in fade-in duration-300">
              <header className="border-b pb-5">
                <h2 className="text-2xl font-bold tracking-tight">Aparência</h2>
                <p className="mt-1 text-muted-foreground">Ajuste a identidade visual da sua experiência.</p>
              </header>
              <Appearance />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { useSearchParams, useRouter } from "next/navigation";
import { HeroImageSide } from "@/components/auth";
import { ButtonSubmit, Input } from "@workspace/ui";
import { resetPasswordAction } from "@/actions/password-recovery";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("Token de recuperação ausente ou inválido.");
      return;
    }

    if (password.length < 6) {
      toast.error("A palavra-passe deve conter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As palavras-passe introduzidas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordAction(token, password);
      if (res.error) {
        toast.error(res.error);
      } else {
        setSuccess(true);
        toast.success(res.message);
        setTimeout(() => {
          router.replace("/auth/login");
        }, 2500);
      }
    } catch {
      toast.error("Ocorreu um erro ao atualizar a palavra-passe.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-4 bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-sm">
        <p className="font-semibold text-destructive">Link inválido ou incompleto</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          O link de recuperação não contém o token de segurança necessário. Por favor solicite um novo link.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-2 text-xs font-semibold text-purple-600 hover:underline inline-flex items-center gap-1"
        >
          Pedir novo link de recuperação
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-sm">
        <CheckCircle2 className="size-10 text-purple-600 dark:text-purple-400" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Palavra-passe Atualizada!</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            A sua nova palavra-passe foi guardada com sucesso. A redirecionar para o ecrã de início de sessão...
          </p>
        </div>
        <Link
          href="/auth/login"
          className="mt-2 text-xs font-semibold text-purple-600 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" /> Ir para Início de Sessão
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Nova palavra-passe
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo de 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar nova palavra-passe
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repita a nova palavra-passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <ButtonSubmit isLoading={loading} className="w-full">
        {loading ? "A guardar..." : "Guardar Nova Palavra-passe"}
      </ButtonSubmit>

      <div className="text-center mt-2">
        <Link
          href="/auth/login"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Cancelar e voltar ao login
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block">
        <HeroImageSide />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 shadow-[-8px_0_32px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_40px_rgba(0,0,0,0.35)]">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <Image src={Logo} alt="Mindware Logo" className="size-20" priority />
              <h1 className="text-2xl font-bold">Definir Nova Senha</h1>
              <p className="text-muted-foreground text-sm">
                Escolha uma nova palavra-passe segura para a sua conta
              </p>
            </div>

            <Suspense fallback={<div className="text-center py-6 text-sm text-muted-foreground">A carregar formulário...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

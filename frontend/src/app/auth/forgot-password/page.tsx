"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { HeroImageSide } from "@/components/auth";
import { ButtonSubmit, Input } from "@workspace/ui";
import { forgotPasswordAction } from "@/actions/password-recovery";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor insira o seu endereço de email.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPasswordAction(email);
      if (res.error) {
        toast.error(res.error);
      } else {
        setSubmitted(true);
        toast.success(res.message);
      }
    } catch {
      toast.error("Ocorreu um erro ao enviar o pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

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
              <h1 className="text-2xl font-bold">Recuperar Palavra-passe</h1>
              <p className="text-muted-foreground text-sm">
                Introduza o seu email para receber o link de redefinição
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center text-center gap-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-sm">
                <CheckCircle2 className="size-10 text-purple-600 dark:text-purple-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Email enviado com sucesso!</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Se existir uma conta associada a <strong className="text-foreground">{email}</strong>,
                    receberá as instruções e o link de acesso em alguns instantes.
                  </p>
                </div>
                <Link
                  href="/auth/login"
                  className="mt-2 text-xs font-semibold text-purple-600 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-3.5" /> Voltar para o início de sessão
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email registado
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <ButtonSubmit isLoading={loading} className="w-full">
                  {loading ? "A enviar..." : "Enviar Link de Recuperação"}
                </ButtonSubmit>

                <div className="text-center mt-2">
                  <Link
                    href="/auth/login"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Lembra-se da senha? Iniciar sessão
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

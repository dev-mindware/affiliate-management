"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/schemas";
import { ButtonSubmit, Input } from "@workspace/ui";
import { registerAction } from "@/actions/register";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function handleRegister(data: RegisterFormData) {
    try {
      const res = await registerAction(data);

      if (res.error) {
        ErrorMessage(res.error);
        return;
      }

      SuccessMessage("Cadastro realizado! A sua conta está pendente de aprovação.");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
      ErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="flex flex-col gap-6 max-h-[90vh] overflow-y-auto pr-2 scrollbar-thin">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image src={Logo} alt="Logo" className="size-20" />
        <h1 className="text-2xl font-bold">Criar conta de afiliado</h1>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome Completo *</label>
          <Input
            type="text"
            placeholder="Seu nome completo"
            {...register("nome_completo")}
          />
          {errors.nome_completo && (
            <p className="text-xs text-destructive">{errors.nome_completo.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
          <Input
            type="email"
            placeholder="exemplo@mindware.ao"
            {...register("email")}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Senha *</label>
          <Input
            type="password"
            placeholder="Senha com pelo menos 6 caracteres"
            {...register("password")}
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefone (opcional)</label>
          <Input
            type="text"
            placeholder="+244 923 000 000"
            {...register("telefone")}
          />
          {errors.telefone && (
            <p className="text-xs text-destructive">{errors.telefone.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banco (opcional)</label>
            <Input
              type="text"
              placeholder="Ex: BAI"
              {...register("banco")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IBAN/Conta (opcional)</label>
            <Input
              type="text"
              placeholder="AO06..."
              {...register("conta_bancaria")}
            />
          </div>
        </div>

        <ButtonSubmit className="mt-2" isLoading={isSubmitting}>
          {isSubmitting ? "" : "Cadastrar"}
        </ButtonSubmit>

        <div className="text-center text-sm text-muted-foreground mt-2">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </div>
      </div>
    </form>
  );
}

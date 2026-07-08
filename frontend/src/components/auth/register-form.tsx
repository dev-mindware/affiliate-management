"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/brand.png";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ErrorMessage, SuccessMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/schemas";
import { ButtonSubmit, Input, SelectField } from "@workspace/ui";
import { registerAction } from "@/actions/register";

const ANGOLAN_BANKS = [
  { name: "BAI", code: "0040" },
  { name: "BIC", code: "0051" },
  { name: "BCI", code: "0005" },
  { name: "SOL", code: "0044" },
  { name: "BFA", code: "0006" },
  { name: "ATLANTICO", code: "0055" },
];

const bankOptions = ANGOLAN_BANKS.map((b) => ({ value: b.name, label: b.name }));

// Formata: AO06 + resto dos dígitos agrupados de 4 em 4, separados por ponto
function formatIban(raw: string) {
  const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!clean.startsWith("AO")) return raw;

  const prefix = clean.slice(0, 4); // "AO06"
  const rest = clean.slice(4, 4 + 21); // máx. 21 dígitos (código do banco + conta)

  const groups: string[] = [];
  for (let i = 0; i < rest.length; i += 4) {
    groups.push(rest.slice(i, i + 4));
  }

  return [prefix, ...groups].join(".");
}

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
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
          <Input
            type="text"
            label="Nome Completo"
            placeholder="Seu nome completo"
            {...register("nome_completo")}
            error={errors.nome_completo?.message}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            type="email"
            label="Correio Electrônico"
            placeholder="exemplo@mindware.ao"
            {...register("email")}
            autoComplete="email"
            error={errors.email?.message}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            type="password"
            label="Palavra - Passe"
            placeholder="Senha com pelo menos 6 caracteres"
            {...register("password")}
            autoComplete="new-password"
            error={errors.password?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Input
            type="text"
            label="Telefone"
            placeholder="+244 923 000 000"
            {...register("telefone")}
            error={errors.telefone?.message}
          />

          <div className="flex flex-col gap-1.5">
            <Controller
              name="banco"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Banco"
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    const bank = ANGOLAN_BANKS.find((b) => b.name === val);
                    if (bank) {
                      // Só preenche o prefixo, sem forçar validação do IBAN ainda
                      setValue("conta_bancaria", formatIban(`AO06${bank.code}`));
                    }
                  }}
                  options={bankOptions}
                  placeholder="Seleccione o banco"
                />
              )}
            />
            {errors.banco && (
              <p className="text-xs text-red-500">{errors.banco.message}</p>
            )}
          </div>
        </div>

        <div className="gap-3">
          <Controller
            name="conta_bancaria"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                label="IBAN"
                placeholder="AO06.0040.0000.5660.0824.1017.4"
                value={field.value}
                onChange={(e) => field.onChange(formatIban(e.target.value))}
                error={errors.conta_bancaria?.message}
              />
            )}
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
    </form>
  );
}
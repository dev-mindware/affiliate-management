import Image from "next/image";
import { Badge, Icon } from "@workspace/ui";

export function MindgestFormExplainer() {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon name="UserPlus" className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Como os seus Clientes se Registam no Mindgest
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Conheça o formulário oficial de adesão do cliente e como o seu código de parceiro é registado com segurança.
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start md:self-auto border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs font-medium"
        >
          Atribuição Perpétua
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Showcase: Imagem do Formulário */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-stone-950 p-2 sm:p-3 shadow-md">
            {/* Header simulado do browser/app */}
            <div className="flex items-center justify-between px-2 pb-2.5 pt-1 border-b border-stone-800 text-[11px] text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-stone-700" />
                <span className="size-2 rounded-full bg-stone-700" />
                <span className="size-2 rounded-full bg-stone-700" />
              </div>
              <span className="font-mono text-[10px] text-stone-300 truncate max-w-[180px]">
                mindgest.mindware.ao/auth/register
              </span>
              <span className="size-3" />
            </div>

            {/* Imagem real do formulário */}
            <div className="relative mt-2 overflow-hidden rounded-xl bg-black">
              <Image
                src="/Mindgest Register Form.png"
                alt="Formulário de Cadastro do Mindgest"
                width={500}
                height={650}
                className="w-full h-auto object-contain rounded-lg"
                priority
              />
            </div>

            {/* Legenda contextual */}
            <div className="mt-3 px-1 py-1.5 text-center">
              <p className="text-[11px] text-stone-300 font-medium">
                Passo 1 do Registo do Cliente no Mindgest
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Destaque para o campo <strong>&ldquo;Código de Afiliado&rdquo;</strong> (MWD-AO-XXXX).
              </p>
            </div>
          </div>
        </div>

        {/* Explicação detalhada dos campos e funcionamento */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Atribuição Automática via Link */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-4.5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Icon name="Link" className="size-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                1. Atribuição 100% Automática pelo Link de Afiliado
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-9.5">
              Quando partilha o seu link oficial (ex.:{" "}
              <code className="text-primary font-mono font-semibold">
                https://mindgest.ao/auth/register?ref=MWD-AO-XXXX
              </code>
              ), o formulário lê automaticamente o parâmetro, preenche o seu código de afiliado e{" "}
              <strong>bloqueia o campo para edição</strong>. O cliente não precisa de digitar nada e a comissão fica garantida.
            </p>
          </div>

          {/* Card 2: Inserção Manual do Código */}
          <div className="rounded-xl border bg-card p-4 sm:p-4.5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 border border-border">
                <Icon name="FilePen" className="size-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                2. Inserção Manual do Código pelo Cliente
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-9.5">
              Caso o cliente aceda diretamente ao site sem o link parametrizado, o campo{" "}
              <strong className="text-foreground">&ldquo;Código de Afiliado (Opcional)&rdquo;</strong>{" "}
              permite digitar o seu código pessoal. O sistema valida em tempo real a máscara oficial angolana (
              <code className="font-mono text-primary">MWD-AO-XXXX</code>).
            </p>
          </div>

          {/* Card 3: Etapas do Fluxo de Registo */}
          <div className="rounded-xl border bg-card p-4 sm:p-4.5 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 border border-border">
                <Icon name="CircleCheck" className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                3. As 3 Etapas do Registo no Mindgest
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pl-0 sm:pl-9.5 pt-1 text-xs">
              <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Passo 1
                </span>
                <p className="font-semibold text-foreground">Dados do Titular</p>
                <p className="text-muted-foreground text-[11px]">
                  Nome, email, telefone angolano e código de parceiro.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Passo 2
                </span>
                <p className="font-semibold text-foreground">Empresa & NIF</p>
                <p className="text-muted-foreground text-[11px]">
                  Validação de NIF na AGT, morada e denominação social.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Passo 3
                </span>
                <p className="font-semibold text-foreground">Plano & Termos</p>
                <p className="text-muted-foreground text-[11px]">
                  Escolha da subscrição (Base, Smart ou Pro) e ativação.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Vinculação Perpétua e Regras de Pagamento */}
          <div className="rounded-xl border bg-muted/30 p-4 sm:p-4.5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Icon name="ShieldCheck" className="size-4.5" />
            </div>
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold text-foreground">
                Vinculação Perpétua na Sua Carteira
              </p>
              <p className="text-muted-foreground">
                Assim que o cliente conclui o cadastro e paga a primeira mensalidade ou anuidade, a empresa fica permanentemente vinculada ao seu ID de parceiro. Você recebe <strong>20% de imediato</strong> e de <strong>15% a 38% em todas as renovações futuras</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

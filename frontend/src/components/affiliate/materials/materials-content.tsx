"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge, Icon } from "@workspace/ui";

interface MarketingAsset {
  id: string;
  title: string;
  filename: string;
  category: "institucional" | "recursos" | "pos" | "planos";
  categoryLabel: string;
  size: string;
  dimensions: string;
  description: string;
}

const MARKETING_ASSETS: MarketingAsset[] = [
  {
    id: "art-1",
    title: "Mindgest — Software de Faturação Certificado AGT",
    filename: "764661118_122180858966830179_3555850332290968844_n.jpg",
    category: "institucional",
    categoryLabel: "Institucional",
    size: "251 KB",
    dimensions: "1080 x 1080",
    description: "Arte principal destacando a certificação da AGT e conformidade legal.",
  },
  {
    id: "art-2",
    title: "Faturação Rápida e Intuitiva",
    filename: "WhatsApp Image 2026-09-04 at 12.54.58 PM.jpeg",
    category: "recursos",
    categoryLabel: "Recursos",
    size: "180 KB",
    dimensions: "1080 x 1080",
    description: "Destaque da agilidade na emissão de faturas no balcão ou escritório.",
  },
  {
    id: "art-3",
    title: "Gestão Inteligente para Pequenos e Médios Negócios",
    filename: "WhatsApp Image 2026-09-04 at 12.54.58 PM (1).jpeg",
    category: "institucional",
    categoryLabel: "Institucional",
    size: "105 KB",
    dimensions: "1080 x 1080",
    description: "Apresentação executiva do software voltada a gestores e proprietários.",
  },
  {
    id: "art-4",
    title: "Acesso no Telemóvel, Tablet e Computador",
    filename: "WhatsApp Image 2026-09-04 at 12.54.59 PM.jpeg",
    category: "recursos",
    categoryLabel: "Recursos",
    size: "334 KB",
    dimensions: "1080 x 1080",
    description: "Evidencia a facilidade multiplataforma com acesso de qualquer lugar.",
  },
  {
    id: "art-5",
    title: "Controle de Stock e Vendas sem Complicação",
    filename: "WhatsApp Image 2026-09-04 at 12.54.59 PM (1).jpeg",
    category: "pos",
    categoryLabel: "Gestão & Stock",
    size: "397 KB",
    dimensions: "1080 x 1080",
    description: "Ideal para lojas, armazéns e supermercados que necessitam de controle rigoroso.",
  },
  {
    id: "art-6",
    title: "Relatórios e Balanços em Tempo Real",
    filename: "WhatsApp Image 2026-09-04 at 12.54.59 PM (2).jpeg",
    category: "recursos",
    categoryLabel: "Recursos",
    size: "293 KB",
    dimensions: "1080 x 1080",
    description: "Demonstração dos gráficos analíticos de faturação e rentabilidade.",
  },
  {
    id: "art-7",
    title: "Ponto de Venda Ágil (POS Balcão)",
    filename: "WhatsApp Image 2026-09-04 at 12.55.00 PM.jpeg",
    category: "pos",
    categoryLabel: "Ponto de Venda",
    size: "260 KB",
    dimensions: "1080 x 1080",
    description: "Focado em caixas de atendimento com emissão instantânea de recibos e faturas.",
  },
  {
    id: "art-8",
    title: "Ideal para Restaurantes, Cafés e Bares",
    filename: "WhatsApp Image 2026-09-04 at 12.55.08 PM.jpeg",
    category: "pos",
    categoryLabel: "Setores",
    size: "107 KB",
    dimensions: "1080 x 1080",
    description: "Comunicação visual direcionada ao setor de restauração e hotelaria.",
  },
  {
    id: "art-9",
    title: "Conformidade Legal e Certificação Fiscal AGT",
    filename: "WhatsApp Image 2026-09-04 at 12.55.08 PM (1).jpeg",
    category: "institucional",
    categoryLabel: "Conformidade",
    size: "300 KB",
    dimensions: "1080 x 1080",
    description: "Reforço da segurança jurídica contra multas fiscais da AGT.",
  },
  {
    id: "art-10",
    title: "Planos Acessíveis a Partir de 5.445,22 Kz",
    filename: "WhatsApp Image 2026-09-04 at 12.55.08 PM (2).jpeg",
    category: "planos",
    categoryLabel: "Planos & Preços",
    size: "335 KB",
    dimensions: "1080 x 1080",
    description: "Excelente para apresentar a competitividade de preço dos planos Mindgest.",
  },
  {
    id: "art-11",
    title: "Subscreva Já e Digitalize a sua Empresa",
    filename: "WhatsApp Image 2026-09-04 at 12.55.09 PM.jpeg",
    category: "planos",
    categoryLabel: "Chamada para Ação",
    size: "300 KB",
    dimensions: "1080 x 1080",
    description: "Arte de fecho com forte chamada para ação e contacto comercial.",
  },
];

const SALES_COPIES = [
  {
    id: "copy-1",
    title: "WhatsApp para Comércio, Minimercados e Lojas",
    badge: "Alta Conversão",
    text: `Olá! Como está a gerir a faturação e o stock da sua loja atualmente?

Gostaria de lhe apresentar o Mindgest, o software de faturação e gestão empresarial certificado pela AGT.

Com o Mindgest pode:
✅ Emitir faturas e recibos válidos em segundos (no PC, tablet ou telemóvel)
✅ Controlar o stock e entradas de produtos em tempo real
✅ Fecho de caixa diário sem erros ou faltas
✅ Planos a partir de apenas 5.445,22 Kz/mês

Pode experimentar e subscrever diretamente através deste link oficial:
{{SEU_LINK_DE_PARCEIRO}}

Qualquer dúvida, estou à disposição para ajudar na configuração inicial!`,
  },
  {
    id: "copy-2",
    title: "WhatsApp para Restaurantes, Bares e Hamburguerias",
    badge: "Restauração",
    text: `Boa tarde! Tem procurado um sistema simples e rápido para atendimento no balcão do seu restaurante?

O Mindgest conta com um Ponto de Venda (POS) ultra-rápido, 100% certificado pela AGT e adaptado para a realidade do comércio em Angola.

Principais vantagens:
🍔 Emissão instantânea de pedidos e faturas no balcão
📊 Relatórios detalhados dos pratos e bebidas mais vendidos
🔒 Sistema seguro e em total conformidade com as normas fiscais
💰 Sem custos de instalação abusivos

Registe-se e conheça os planos disponíveis aqui:
{{SEU_LINK_DE_PARCEIRO}}`,
  },
  {
    id: "copy-3",
    title: "Prestadores de Serviços, Clínicas e Consultores",
    badge: "Serviços",
    text: `Prezado(a), a sua empresa já emite faturas certificadas pela AGT de forma digital e sem complicações?

Evite multas e ganhe mais credibilidade com os seus clientes empresariais utilizando o Mindgest.

Vantagens imediatas:
📄 Emissão de faturas proforma, faturas normais e recibos em PDF
📧 Envio direto por email ou WhatsApp para o seu cliente
💳 Acesso seguro na nuvem a partir de qualquer navegador
⚡ Ativação imediata sem necessidade de técnicos no local

Subscreva o plano ideal para a sua atividade através do link:
{{SEU_LINK_DE_PARCEIRO}}`,
  },
  {
    id: "copy-4",
    title: "Status de WhatsApp / Stories do Instagram",
    badge: "Redes Sociais",
    text: `Precisa de um software de faturação certificado pela AGT para a sua empresa ou loja? 💼🇦🇴

Com o Mindgest emite faturas e controla o seu negócio em segundos, pelo computador ou telemóvel!

👉 Planos a partir de 5.445,22 Kz/mês.
Fale comigo ou clique no link da bio para ativar hoje mesmo! 🚀`,
  },
];

export function MaterialsContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activePreview, setActivePreview] = useState<MarketingAsset | null>(null);

  const filteredAssets =
    selectedCategory === "all"
      ? MARKETING_ASSETS
      : MARKETING_ASSETS.filter((item) => item.category === selectedCategory);

  function copyToClipboard(text: string, title: string) {
    navigator.clipboard.writeText(text);
    toast.success(`Texto "${title}" copiado com sucesso!`);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* BANNER PRINCIPAL DE DOWNLOAD COMPLETO */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-background p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Icon name="Sparkles" size={13} />
              Kit Oficial de Divulgação Mindgest
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Tudo o que precisa para divulgar e fechar novos clientes
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Disponibilizamos <strong>11 artes promocionais em alta definição</strong> e modelos de texto prontos
              para partilhar nas redes sociais e WhatsApp. Descarregue o pacote completo em arquivo compactado (ZIP)
              ou baixe cada imagem individualmente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="/mindgest-materiais-parceiros.zip"
              download="mindgest-materiais-parceiros.zip"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.99]"
            >
              <Icon name="FolderDown" size={18} />
              Descarregar Pacote Completo (ZIP • 2.8 MB)
            </a>
          </div>
        </div>
      </div>

      {/* SECÇÃO 1: GALERIA DE ARTES */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Icon name="Image" size={20} className="text-primary" />
              Artes e Banners Promocionais
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {filteredAssets.length} disponíveis
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clique em qualquer arte para visualizar em tamanho ampliado ou faça o download direto.
            </p>
          </div>

          {/* FILTROS DE CATEGORIA */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas ({MARKETING_ASSETS.length})
            </button>
            <button
              onClick={() => setSelectedCategory("institucional")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === "institucional"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Institucional
            </button>
            <button
              onClick={() => setSelectedCategory("pos")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === "pos"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lojas & POS
            </button>
            <button
              onClick={() => setSelectedCategory("recursos")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === "recursos"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Recursos
            </button>
            <button
              onClick={() => setSelectedCategory("planos")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === "planos"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Planos
            </button>
          </div>
        </div>

        {/* GRID DE ARTES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => {
            const assetUrl = `/marketing-assets/${encodeURIComponent(asset.filename)}`;
            return (
              <div
                key={asset.id}
                className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/40"
              >
                {/* ÁREA DA IMAGEM COM HOVER PREVIEW */}
                <div
                  onClick={() => setActivePreview(asset)}
                  className="relative aspect-square w-full bg-muted/30 cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  <Image
                    src={assetUrl}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                      <Icon name="Eye" size={14} />
                      Visualizar
                    </span>
                  </div>
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="secondary" className="text-[10px] font-semibold bg-background/90 backdrop-blur-xs">
                      {asset.categoryLabel}
                    </Badge>
                  </div>
                </div>

                {/* DETALHES E BOTÕES */}
                <div className="flex flex-col flex-1 p-4 justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {asset.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {asset.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {asset.size} • {asset.dimensions}
                    </span>
                    <a
                      href={assetUrl}
                      download={`Mindgest-${asset.category}-${asset.id}.${asset.filename.split('.').pop() || 'jpg'}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Icon name="Download" size={13} />
                      Baixar
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECÇÃO 2: TEXTOS E COPIES PRONTOS PARA VENDAS */}
      <div className="space-y-5 pt-4 border-t border-border">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Icon name="FileText" size={20} className="text-primary" />
            Modelos de Mensagens & Textos Comerciais
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Copie estes textos prontos, substitua pelo seu link exclusivo de parceiro e envie aos seus contactos no WhatsApp ou redes sociais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SALES_COPIES.map((copy) => (
            <div
              key={copy.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/30 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{copy.title}</h4>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    {copy.badge}
                  </Badge>
                </div>
                <div className="rounded-lg bg-muted/40 p-3.5 border border-border/80">
                  <pre className="font-sans text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {copy.text}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted-foreground">
                  💡 Não se esqueça de anexar o seu link de parceiro.
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(copy.text, copy.title)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer"
                >
                  <Icon name="Copy" size={13} />
                  Copiar Mensagem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECÇÃO 3: DICAS PRÁTICAS PARA O AFILIADO */}
      <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Icon name="Info" size={16} className="text-primary" />
          Recomendações para Maximizar as suas Comissões no Mindgest
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div className="space-y-1 rounded-lg bg-background p-3.5 border border-border">
            <strong className="text-foreground block font-semibold text-xs">1. Foco na Obrigatoriedade AGT</strong>
            <p>
              Explique ao cliente que a faturação certificada é uma exigência legal e evita multas fiscais pesadas. O Mindgest resolve isso a partir de apenas 5.445,22 Kz.
            </p>
          </div>
          <div className="space-y-1 rounded-lg bg-background p-3.5 border border-border">
            <strong className="text-foreground block font-semibold text-xs">2. Garanta a Atribuição</strong>
            <p>
              Peça sempre ao cliente que abra a conta através do seu link de afiliado ou insira o seu código no momento da subscrição para garantir os 20% no primeiro mês e até 38% recorrentes.
            </p>
          </div>
          <div className="space-y-1 rounded-lg bg-background p-3.5 border border-border">
            <strong className="text-foreground block font-semibold text-xs">3. Suporte da Equipa Mindware</strong>
            <p>
              Dúvidas sobre demonstrações com clientes grandes? Fale com a equipa da Mindware pelo WhatsApp oficial:{" "}
              <a href="https://wa.me/244943100922" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">
                943 100 922
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL LIGHTBOX DE PREVIEW */}
      {activePreview && (
        <div
          onClick={() => setActivePreview(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-card rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground">{activePreview.title}</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {activePreview.dimensions} • {activePreview.size}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="relative flex-1 min-h-[360px] md:min-h-[500px] bg-muted/40 flex items-center justify-center p-2">
              <Image
                src={`/marketing-assets/${encodeURIComponent(activePreview.filename)}`}
                alt={activePreview.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-4 bg-card border-t border-border flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground hidden sm:block">
                {activePreview.description}
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted cursor-pointer"
                >
                  Fechar
                </button>
                <a
                  href={`/marketing-assets/${encodeURIComponent(activePreview.filename)}`}
                  download={`Mindgest-${activePreview.filename}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Icon name="Download" size={14} />
                  Descarregar Imagem
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

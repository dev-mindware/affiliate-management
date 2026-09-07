export interface MarketingAsset {
  id: string;
  title: string;
  filename: string;
  category: "institucional" | "recursos" | "pos" | "planos";
  categoryLabel: string;
  size: string;
  dimensions: string;
  description: string;
}

export interface SalesCopy {
  id: string;
  title: string;
  badge: string;
  text: string;
}

export interface CategoryFilter {
  id: "all" | "institucional" | "pos" | "recursos" | "planos";
  label: string;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: "all", label: "Todas as Artes" },
  { id: "institucional", label: "Institucional & AGT" },
  { id: "pos", label: "Lojas & Restauração" },
  { id: "recursos", label: "Recursos & Mobilidade" },
  { id: "planos", label: "Planos & Preços" },
];

export const MARKETING_ASSETS: MarketingAsset[] = [
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

export const SALES_COPIES: SalesCopy[] = [
  {
    id: "copy-1",
    title: "WhatsApp para Comércio, Minimercados e Lojas",
    badge: "Alta Conversão",
    text: `Olá! Como está a gerir a faturação e o stock da sua loja atualmente?

Gostaria de lhe apresentar o Mindgest, o software de faturação e gestão empresarial certificado pela AGT.

Com o Mindgest pode:
- Emitir faturas e recibos válidos em segundos (no PC, tablet ou telemóvel)
- Controlar o stock e entradas de produtos em tempo real
- Fecho de caixa diário sem erros ou faltas
- Planos a partir de apenas 5.445,22 Kz/mês

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
- Emissão instantânea de pedidos e faturas no balcão
- Relatórios detalhados dos pratos e bebidas mais vendidos
- Sistema seguro e em total conformidade com as normas fiscais
- Sem custos de instalação abusivos

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
- Emissão de faturas proforma, faturas normais e recibos em PDF
- Envio direto por email ou WhatsApp para o seu cliente
- Acesso seguro na nuvem a partir de qualquer navegador
- Ativação imediata sem necessidade de técnicos no local

Subscreva o plano ideal para a sua atividade através do link:
{{SEU_LINK_DE_PARCEIRO}}`,
  },
  {
    id: "copy-4",
    title: "Status de WhatsApp / Stories do Instagram",
    badge: "Redes Sociais",
    text: `Precisa de um software de faturação certificado pela AGT para a sua empresa ou loja?

Com o Mindgest emite faturas e controla o seu negócio em segundos, pelo computador ou telemóvel!

Planos a partir de 5.445,22 Kz/mês.
Fale comigo ou clique no link da bio para ativar hoje mesmo!`,
  },
];

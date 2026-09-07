import type { Alignment, Side } from "driver.js";

export type OnboardingTourId =
  | "dashboard"
  | "wallet"
  | "materiais"
  | "clientes"
  | "ranking"
  | "simulador";

export type TourStepDefinition = {
  selector: string;
  title: string;
  description: string;
  side?: Side;
  align?: Alignment;
};

export type TourDefinition = {
  id: OnboardingTourId;
  version: number;
  title: string;
  steps: TourStepDefinition[];
};

export const ONBOARDING_TOURS: Record<OnboardingTourId, TourDefinition> = {
  dashboard: {
    id: "dashboard",
    version: 2,
    title: "Guia Completo do Painel do Parceiro",
    steps: [
      {
        selector: '[data-tour="referral-code"]',
        title: "Código de Indicação Exclusivo",
        description:
          "Este é o seu código pessoal único (formato MWD-AO-XXXX). Os seus clientes podem introduzi-lo no momento do cadastro no Mindgest para que a comissão fique vinculada à sua carteira.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="referral-link"]',
        title: "Link Oficial de Convite de Clientes",
        description:
          "O seu link direto de afiliado (?ref=SEU_CODIGO). Quando um cliente se regista através deste link, a vinculação é 100% automática: receberá 20% no 1º mês e até 38% em todas as renovações mensais ou anuais.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="partner-program"]',
        title: "Mindgest Partners Program & Nível de Carreira",
        description:
          "Aqui visualiza o seu nível de parceria atual (Base, Silver, Gold, Platinum ou Elite). Cada escalão superior desbloqueia bónus mensais recorrentes (+5% até +23%) sobre a faturação de todas as empresas ativas no software.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="level-progress"]',
        title: "Evolução e Progresso de Escalão",
        description:
          "Acompanhe quantos clientes ativos faltam para alcançar o próximo escalão. A subida de nível é automática ao atingir 15 clientes (Silver), 40 (Gold), 100 (Platinum) e 250 clientes ativos (Elite).",
        side: "bottom",
        align: "end",
      },
      {
        selector: '[data-tour="materials-banner"]',
        title: "Materiais Oficiais de Apoio & Divulgação",
        description:
          "Criámos materiais gráficos de alta conversão! Clique para descarregar o Pacote Completo (ZIP de 2.8 MB) com 11 artes profissionais e textos prontos para divulgar no WhatsApp, redes sociais e reuniões.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="kpi-available"]',
        title: "Saldo Disponível (Pronto para Levantamento)",
        description:
          "Comissões já validadas e liquidas prontas para transferência bancária. Assim que atingir o limiar mínimo de 5.000,00 Kz, pode solicitar o levantamento para o seu IBAN a qualquer momento.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="kpi-pending"]',
        title: "Saldo Pendente (Em Validação)",
        description:
          "Comissões de subscrições recentes que se encontram em período de garantia (15 dias) ou compensação bancária. Passam para Saldo Disponível automaticamente assim que a liquidação for confirmada.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="kpi-total"]',
        title: "Total Ganho Histórico",
        description:
          "O valor bruto acumulado de todas as comissões geradas desde a aprovação da sua conta como parceiro. Demonstra o rendimento global produzido pelo seu trabalho de divulgação.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="kpi-clients"]',
        title: "Contagem de Clientes Ativos",
        description:
          "Empresas que utilizam o Mindgest e mantêm planos ativos e pagos. Cada subscrição ativa gera comissão recorrente todos os meses diretamente na sua carteira de parceiro.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="kpi-rank"]',
        title: "Posição no Ranking Nacional",
        description:
          "A sua posição de liderança face a todos os parceiros de Angola. Exibe a distância de clientes necessária para superar o afiliado à sua frente e conquistar prémios especiais.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="commission-chart"]',
        title: "Gráfico de Desempenho e Comissões",
        description:
          "Analise a evolução das suas receitas ao longo do tempo. Alterne entre visão 'Mensal' (dia a dia no mês corrente) e 'Anual' (faturação acumulada) para monitorar os períodos de maior adesão.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="recent-withdrawals"]',
        title: "Histórico de Levantamentos",
        description:
          "Acompanhe o estado dos seus pedidos de pagamento (Pendente, Aprovado ou Rejeitado). Quando a transferência bancária for executada, poderá descarregar o comprovativo bancário oficial diretamente nesta lista.",
        side: "top",
        align: "center",
      },
    ],
  },

  wallet: {
    id: "wallet",
    version: 2,
    title: "Guia da Carteira & Levantamentos",
    steps: [
      {
        selector: '[data-tour="wallet-available"]',
        title: "Saldo Disponível para Saque",
        description:
          "O montante monetário líquido acumulado na sua conta, pronto a ser transferido para a sua conta bancária em Angola.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="wallet-pending"]',
        title: "Saldo Retido ou em Processamento",
        description:
          "Total de comissões que aguardam liquidação de faturas (período de carência de 15 dias) ou pedidos de saque em trânsito pela equipa financeira.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="btn-request-withdrawal"]',
        title: "Botão 'Solicitar Levantamento'",
        description:
          "Fica habilitado assim que atingir 5.000 Kz. Ao clicar, indica o valor a retirar e o pedido é encaminhado para processamento pela equipa financeira da Mindware.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="wallet-min-threshold"]',
        title: "Regra Obrigatória: Limiar Mínimo de 5.000 Kz",
        description:
          "Por regra operacional, os pedidos de levantamento exigem um saldo disponível mínimo de 5.000,00 Kz. Pedidos abaixo deste montante permanecem acumulados na carteira sem expirar.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="bank-details-card"]',
        title: "Coordenadas Bancárias & IBAN de Recebimento",
        description:
          "Mostra o Banco e o IBAN cadastrados. Os pagamentos são efetuados via transferência bancária exclusivamente para esta conta. Mantenha os dados sempre atualizados nas Definições.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="withdrawals-table"]',
        title: "Relação de Pedidos e Estados",
        description:
          "Tabela cronológica de todos os seus saques com data de solicitação, valor em Kwanzas, conta de destino e estado (Pendente, Aprovado ou Rejeitado).",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="receipt-info"]',
        title: "Comprovativo Bancário Oficial",
        description:
          "Assim que a transferência bancária for realizada (prazo de 24h a 48h úteis), a administração anexa o comprovativo oficial nesta tabela para sua conferência e arquivo.",
        side: "top",
        align: "end",
      },
      {
        selector: '[data-tour="wallet-terms"]',
        title: "Sem Taxas Administrativas",
        description:
          "A Mindware não deduz qualquer taxa sobre os levantamentos dos parceiros. O valor líquido solicitado é creditado a 100% na sua conta bancária.",
        side: "top",
        align: "start",
      },
    ],
  },

  materiais: {
    id: "materiais",
    version: 2,
    title: "Guia de Materiais de Apoio & Divulgação",
    steps: [
      {
        selector: '[data-tour="zip-download-cta"]',
        title: "Pacote Completo em 1 Clique (ZIP 2.8 MB)",
        description:
          "Descarregue de uma só vez todas as 11 imagens promocionais oficiais do Mindgest em alta resolução, compactadas num arquivo ZIP pronto para usar no telemóvel ou computador.",
        side: "bottom",
        align: "end",
      },
      {
        selector: '[data-tour="category-filters"]',
        title: "Filtros Rápidos por Segmento",
        description:
          "Filtre as artes por objetivo comercial: 'Institucional' (certificação AGT e confiança), 'Lojas & POS' (retalho e caixas), 'Recursos' (acesso no telemóvel e stock) ou 'Planos' (preços acessíveis).",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="art-cards-grid"]',
        title: "Galeria de Artes Promocionais",
        description:
          "Cada arte foi concebida nas proporções ideais de feed (1080x1080) com mensagens visuais claras sobre o software de faturação Mindgest.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="art-zoom-preview"]',
        title: "Inspeção Visual (Modo Lightbox)",
        description:
          "Clique sobre qualquer arte para abri-la em modo de ecrã inteiro antes de descarregar, facilitando a escolha da imagem ideal para o cliente que vai contactar.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="art-single-download"]',
        title: "Download Individual Organizado",
        description:
          "Prefere enviar apenas uma arte específica? O botão 'Baixar' transfere a imagem isolada com nomenclatura comercial limpa e padronizada.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="sales-copies-section"]',
        title: "Roteiros Comerciais e Scripts de Venda",
        description:
          "Não precisa de criar textos do zero! Disponibilizamos mensagens persuasivas testadas para envio via WhatsApp, adaptadas a minimercados, restaurantes e prestadores de serviços.",
        side: "top",
        align: "start",
      },
      {
        selector: '[data-tour="copy-share-button"]',
        title: "Cópia Instantânea com Seu Link Injetado",
        description:
          "O sistema substitui automaticamente o marcador pelo seu Link Real de Afiliado. Ao clicar em 'Copiar', o texto fica imediatamente pronto a colar no WhatsApp do seu potencial cliente!",
        side: "top",
        align: "end",
      },
      {
        selector: '[data-tour="strategy-tips"]',
        title: "Recomendações para Vencer Objeções",
        description:
          "Dicas de ouro da Mindware: foque na obrigatoriedade fiscal da AGT para evitar multas ao comerciante e utilize o WhatsApp comercial oficial (943 100 922) se precisar de apoio em reuniões grandes.",
        side: "top",
        align: "center",
      },
    ],
  },

  clientes: {
    id: "clientes",
    version: 2,
    title: "Guia de Acompanhamento de Clientes",
    steps: [
      {
        selector: '[data-tour="clients-header"]',
        title: "Gestão da Carteira de Clientes Indicados",
        description:
          "Visão consolidada de todas as empresas registadas através do seu link ou código de parceiro no software Mindgest.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="clients-search"]',
        title: "Filtros Rápidos & Pesquisa",
        description:
          "Pesquise clientes por denominação social, email ou filtre pelo estado da subscrição e plano contratado (Base, Smart ou Pro).",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="anti-churn-badge"]',
        title: "Alerta Anti-Churn (7 Dias de Carência)",
        description:
          "Se uma empresa indicar pagamento falhado, dispõe de 7 dias de carência legal antes do cancelamento da licença. Contacte o cliente para ajudá-lo a renovar e preserve a sua comissão recorrente!",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="clients-table"]',
        title: "Tabela Consolidada de Empresas",
        description:
          "Consulte o nome da empresa, plano contratado, estado da licença e detalhes de faturação para gerir o ciclo de vida dos seus clientes.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="clients-support-note"]',
        title: "Retenção de Clientes = Renda Perpétua",
        description:
          "Clientes satisfeitos com o Mindgest renovam por anos consecutivos. Manter contacto regular com os seus indicados é o segredo para construir uma renda passiva sólida em Angola.",
        side: "top",
        align: "center",
      },
    ],
  },

  ranking: {
    id: "ranking",
    version: 2,
    title: "Guia do Ranking Nacional & Gamificação",
    steps: [
      {
        selector: '[data-tour="ranking-header"]',
        title: "Tabela Nacional de Líderes Mindware",
        description:
          "O ranking classifica os parceiros de maior sucesso em Angola pelo volume de clientes ativos no software Mindgest.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="ranking-podium"]',
        title: "O Pódio de Líderes",
        description:
          "Os três parceiros com maior número de indicações ativas. Parceiros no topo têm destaque em eventos da Mindware e bonificações especiais em campanhas trimestrais.",
        side: "bottom",
        align: "center",
      },
      {
        selector: '[data-tour="ranking-tiers-table"]',
        title: "Escalação de Escalões e Bónus Recorrente",
        description:
          "Os 4 patamares de carreira: Silver (15 clientes = +5% bónus), Gold (40 clientes = +10% bónus), Platinum (100 clientes = +17% bónus) e Elite (250 clientes = +23% bónus cumulativo com a taxa base).",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="ranking-my-position"]',
        title: "Progressão Automática",
        description:
          "A sua posição sobe automaticamente em tempo real sempre que novas empresas pagam e ativam licenças do Mindgest através do seu código.",
        side: "bottom",
        align: "end",
      },
      {
        selector: '[data-tour="ranking-certification-badge"]',
        title: "Certificação Mindgest PRO",
        description:
          "Parceiros elegíveis podem solicitar a Certificação Oficial, recebendo licença Mindgest PRO gratuita e encaminhamento direto de potenciais clientes corporativos da Mindware.",
        side: "top",
        align: "start",
      },
      {
        selector: '[data-tour="ranking-tips"]',
        title: "Estratégia de Crescimento Rápido",
        description:
          "Apresente o Mindgest a minimercados de bairro, lojas de informática, restaurantes e prestadores de serviços da sua rede de contactos para atingir o nível Silver rapidamente.",
        side: "top",
        align: "start",
      },
    ],
  },

  simulador: {
    id: "simulador",
    version: 2,
    title: "Guia do Simulador de Ganhos",
    steps: [
      {
        selector: '[data-tour="sim-header"]',
        title: "Simulador de Ganhos e Projeção Financeira",
        description:
          "Ferramenta interativa para calcular o seu potencial de comissões imediatas e renda passiva recorrente a médio e longo prazo.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="sim-plans"]',
        title: "Selecione o Plano Mindgest",
        description:
          "Escolha o plano que mais indica: Plano Base (comércio inicial), Smart (PMEs) ou Pro (comércio avançado e restauração).",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="sim-slider"]',
        title: "Volume Estimado de Clientes Ativos",
        description:
          "Ajuste a quantidade de empresas que prevê manter ativas na sua carteira (ex.: 10, 20, 50 clientes).",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="sim-churn-field"]',
        title: "Taxa de Churn & Bónus de Retenção",
        description:
          "O churn mede cancelamentos anuais. Manter a retenção alta (< 2% de cancelamentos) adiciona um bónus de +2% à sua comissão mensal recorrente! Passe o cursor pelo ícone de informação para consultar os escalões.",
        side: "bottom",
        align: "start",
      },
      {
        selector: '[data-tour="sim-immediate"]',
        title: "Comissão de Entrada e Nível de Carreira",
        description:
          "Exibe a taxa efetiva total, combinando a taxa base do escalão com os bónus de retenção e antiguidade conquistados.",
        side: "top",
        align: "center",
      },
      {
        selector: '[data-tour="sim-recurring"]',
        title: "Renda Mensal Recorrente Acumulada",
        description:
          "A projeção de rendimento mensal garantido e a faturação anual estimada com base na sua carteira ativa de clientes.",
        side: "top",
        align: "center",
      },
    ],
  },
};

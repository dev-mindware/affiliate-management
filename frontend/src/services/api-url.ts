// Resolve o URL base da API.
//
// No browser devolvemos SEMPRE um caminho relativo same-origin ("/api"). Esses
// pedidos sao reencaminhados server-side para a API real atraves dos rewrites
// definidos em next.config.ts. Isto evita que o browser faca pedidos XHR
// cross-origin para um host que contem a palavra "affiliate"
// (affiliate.mindware-vps.cloud), que sao bloqueados por ad blockers /
// extensoes de privacidade com o erro net::ERR_BLOCKED_BY_CLIENT.
//
// Como o pedido passa a ser feito de servidor-para-servidor (Next -> API), o
// ad blocker do cliente nunca o ve, e tambem deixa de existir preocupacao com
// CORS ou Mixed Content no browser.
const SAME_ORIGIN_API_BASE = "/api";

export function resolveApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return SAME_ORIGIN_API_BASE;
  }

  // Em contexto de servidor (SSR / route handlers) usamos o URL absoluto
  // configurado para chamar a API diretamente.
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";
}

// URL absoluto da API para uso exclusivo no servidor (ex.: rewrites, route
// handlers). Nunca deve ser usado para pedidos feitos a partir do browser.
export function resolveServerApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";
}

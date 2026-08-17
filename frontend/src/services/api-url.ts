// Resolve o URL base da API.
//
// No browser devolvemos SEMPRE um caminho relativo same-origin ("/api").
// Esses pedidos passam pelo BFF (route handler) que reencaminha server-side
// para a API real e injeta o Authorization a partir do cookie httpOnly.
// Assim o browser nunca vê a baseURL absoluta da API nem os tokens.

const SAME_ORIGIN_API_BASE = "/api";

export function resolveApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return SAME_ORIGIN_API_BASE;
  }
  return resolveServerApiBaseUrl();
}

/** URL absoluto da API — exclusivo do servidor. Nunca usar no browser. */
export function resolveServerApiBaseUrl(): string {
  const raw = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3332/api").trim();
  return raw.replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
}

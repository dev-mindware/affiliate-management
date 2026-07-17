import type { NextConfig } from "next";

// URL absoluto da API real (inclui o sufixo "/api"), ex.:
// https://affiliate.mindware-vps.cloud/api
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // beforeFiles/fallback ficam vazios; usamos afterFiles para que os route
      // handlers locais (ex.: /api/auth/refresh) tenham prioridade sobre o
      // proxy para a API externa.
      beforeFiles: [],
      afterFiles: [
        {
          // Todos os pedidos same-origin do browser para /api/* que nao sejam
          // resolvidos por route handlers locais sao reencaminhados
          // server-side para a API real. Assim o browser nunca contacta o host
          // "affiliate.*" diretamente (evita net::ERR_BLOCKED_BY_CLIENT).
          source: "/api/:path*",
          destination: `${API_BASE_URL}/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;

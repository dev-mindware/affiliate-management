import type { NextConfig } from "next";

// A baseURL real da API fica apenas no servidor (API_URL).
// O browser fala só com /api/* (BFF em src/app/api/[...path]/route.ts).
const nextConfig: NextConfig = {
  // Evita que variáveis de servidor vazem para o client bundle por engano.
  poweredByHeader: false,
};

export default nextConfig;

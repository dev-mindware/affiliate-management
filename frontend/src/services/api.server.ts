import axios from "axios";
import { resolveServerApiBaseUrl } from "./api-url";
import { getAccessToken } from "@/lib/server-tokens";

/**
 * Axios exclusivo do servidor (Server Actions / RSC).
 * Não importar a partir de Client Components.
 */
export const api = axios.create({
  baseURL: resolveServerApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  config.baseURL = resolveServerApiBaseUrl();

  const url = config.url || "";
  const isPublicAuthRoute =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password") ||
    url.includes("/auth/refresh");

  if (!isPublicAuthRoute) {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;

import axios from "axios";
import { resolveApiBaseUrl } from "@/services/api-url";

export const api = axios.create({
  baseURL: typeof window !== "undefined" ? "/api" : resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = "/api";
    config.withCredentials = true;
    if (config.headers) {
      delete (config.headers as Record<string, unknown>).Authorization;
    }
  }
  return config;
});

export default api;

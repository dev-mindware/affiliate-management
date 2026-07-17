import axios from "axios";
import { resolveApiBaseUrl } from "@/services/api-url";

export const api = axios.create({
  baseURL: typeof window !== "undefined" ? resolveApiBaseUrl() : "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") config.baseURL = resolveApiBaseUrl();
  return config;
});

export default api;


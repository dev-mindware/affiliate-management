import axios from "axios";

/**
 * Axios do workspace no browser: same-origin BFF apenas.
 * Sem next/headers / tokens no client bundle.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = "/api";
  config.withCredentials = true;
  if (config.headers) {
    delete (config.headers as Record<string, unknown>).Authorization;
  }
  return config;
});

export default api;

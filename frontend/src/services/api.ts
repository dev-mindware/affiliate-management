import axios from "axios";
import { BASE_PATH } from "@/constants/routes";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
};

/**
 * Axios do browser: só same-origin `/api` (BFF).
 * Nunca importa next/headers nem tokens — o proxy injeta o Authorization.
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

const refreshApi = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const url = original?.url || "";

    if (
      typeof window === "undefined" ||
      url.includes("/auth/login") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/refresh") ||
      original?._retry
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await refreshApi.post(`${BASE_PATH}/api/auth/refresh`);
        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.replace(`${BASE_PATH}/auth/login`);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;

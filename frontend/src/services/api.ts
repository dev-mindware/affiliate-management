import axios from "axios";
import { BASE_PATH } from "@/constants/routes";
import { resolveApiBaseUrl, resolveServerApiBaseUrl } from "./api-url";

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

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    // Browser: only same-origin BFF. Tokens stay in httpOnly cookies.
    config.baseURL = "/api";
    config.withCredentials = true;
    if (config.headers) {
      delete (config.headers as Record<string, unknown>).Authorization;
    }
    return config;
  }

  // Server (SSR / server actions): call API directly and attach Bearer from httpOnly cookie.
  config.baseURL = resolveServerApiBaseUrl();
  const url = config.url || "";
  const isPublicAuthRoute =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password") ||
    url.includes("/auth/refresh");

  if (!isPublicAuthRoute) {
    const { getAccessToken } = await import("@/lib/server-tokens");
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

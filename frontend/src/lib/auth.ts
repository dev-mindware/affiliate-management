import { getAccessToken } from "@/lib/server-tokens";
import api from "@/services/api";

export async function getSession() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  return { authenticated: true as const };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch {
    return null;
  }
}

import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/auth";

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
}

function cookieSecurity() {
  const isSecure =
    ACCESS_TOKEN_KEY.startsWith("__Secure-") || process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function createSession(payload: SessionPayload) {
  const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const authCookies = await cookies();
  const base = cookieSecurity();

  authCookies.set(ACCESS_TOKEN_KEY, payload.accessToken, {
    ...base,
    expires: accessExpiresAt,
  });

  authCookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, {
    ...base,
    expires: refreshExpiresAt,
  });
}

export async function destroySession() {
  const authCookies = await cookies();
  const base = cookieSecurity();
  const expired = { ...base, expires: new Date(0) };

  authCookies.set(ACCESS_TOKEN_KEY, "", expired);
  authCookies.set(REFRESH_TOKEN_KEY, "", expired);

  // Cleanup legacy / non-httpOnly cookies
  authCookies.set(ACCESS_TOKEN_KEY, "", { ...expired, httpOnly: false });
  authCookies.set("access_token", "", { ...expired, httpOnly: false });
  authCookies.set("refresh_token", "", expired);
}

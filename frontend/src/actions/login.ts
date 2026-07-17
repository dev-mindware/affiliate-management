"use server";
import { redirect } from "next/navigation";
import api from "@/services/api.server";
import { createSession, destroySession } from "@/lib/session";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function loginAction(data: any) {
  try {
    const res = await api.post<LoginResponse>("/auth/login/json", {
      email: data.email,
      password: data.password,
    });

    const { access_token, refresh_token } = res.data;

    await createSession({
      accessToken: access_token,
      refreshToken: refresh_token,
    });

    const userRes = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (userRes.data.role?.toLowerCase() !== "affiliate") {
      await destroySession();
      return { error: "Acesso restrito a afiliados." };
    }

    // Tokens ficam só em cookies httpOnly — nunca regressam ao browser.
    return {
      success: true,
      user: userRes.data,
    };
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Erro ao realizar login. Verifique as suas credenciais.";
    return { error: message };
  }
}

export async function logoutAction() {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout Error:", error);
  } finally {
    await destroySession();
    redirect("/auth/login");
  }
}

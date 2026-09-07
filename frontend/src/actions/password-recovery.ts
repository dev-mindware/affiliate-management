"use server";
import api from "@/services/api.server";

export async function forgotPasswordAction(email: string) {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return {
      success: true,
      message: res.data?.message || "Instruções enviadas para o seu email.",
    };
  } catch (error: any) {
    console.error("Forgot Password Error:", error.response?.data || error.message);
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Ocorreu um erro ao processar o seu pedido. Tente novamente.";
    return { error: message };
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    const res = await api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return {
      success: true,
      message: res.data?.message || "Palavra-passe atualizada com sucesso.",
    };
  } catch (error: any) {
    console.error("Reset Password Error:", error.response?.data || error.message);
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Token inválido ou expirado. Por favor solicite um novo link.";
    return { error: message };
  }
}

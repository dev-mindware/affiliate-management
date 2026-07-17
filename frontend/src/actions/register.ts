"use server";
import api from "@/services/api.server";

export async function registerAction(data: any) {
  try {
    await api.post("/auth/register", {
      nome_completo: data.nome_completo,
      email: data.email,
      password: data.password,
      telefone: data.telefone || undefined,
      conta_bancaria: data.conta_bancaria || undefined,
      banco: data.banco || undefined,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Register Error:", error.response?.data || error.message);
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Erro ao realizar cadastro. Tente novamente.";
    return { error: message };
  }
}

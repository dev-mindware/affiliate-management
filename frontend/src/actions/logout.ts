"use server";

import { destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import api from "@/services/api";
import { BASE_PATH } from "@/constants/routes";

export async function logoutAction() {
  try {
    await api.post("/auth/logout");
  } catch {
  } finally {
    await destroySession();
    redirect(`${BASE_PATH}/auth/login`);
  }
}

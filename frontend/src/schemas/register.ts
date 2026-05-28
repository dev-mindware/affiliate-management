import { z } from "zod";

export const registerSchema = z.object({
  nome_completo: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().trim().min(6, "A senha deve ter pelo menos 6 caracteres"),
  telefone: z.string().trim().optional().or(z.literal("")),
  conta_bancaria: z.string().trim().optional().or(z.literal("")),
  banco: z.string().trim().optional().or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

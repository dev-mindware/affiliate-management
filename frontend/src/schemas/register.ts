import { z } from "zod";


// After removing dots/spaces, accepts:
// - Full Angola IBAN: AO + 2 check digits + 21 numeric digits (25 chars)
// - Body only: 21 numeric digits
const angolaIbanBodyRegex = /^(AO\d{2})?\d{21}$/;

  /** Normalizes an IBAN by stripping dots, spaces and uppercasing. */
const normalizeIban = (value: string) =>
  value.replace(/[.\s]/g, "").toUpperCase();

export const ibanSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || angolaIbanBodyRegex.test(normalizeIban(val)),
    "IBAN inválido — utilize o formato AO06.0040.0000.5660.0824.1017.4",
  );


export const registerSchema = z.object({
  nome_completo: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().trim().min(6, "A senha deve ter pelo menos 6 caracteres"),
  telefone: z.string().trim().optional().or(z.literal("")),
  conta_bancaria: ibanSchema,
  banco: z.string().trim().or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

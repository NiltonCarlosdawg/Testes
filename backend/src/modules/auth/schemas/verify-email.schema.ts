// src/modules/auth/schemas/verify-email.schema.ts
import { z } from "zod";

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d+$/, "Código deve conter apenas números"),
});

export type TVerifyEmailInput = z.infer<typeof verifyEmailSchema>;
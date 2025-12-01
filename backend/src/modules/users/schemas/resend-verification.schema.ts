import { z } from "zod";

export const resendVerificationSchema = {
  type: "object",
  required: ["email"],
  properties: {
    email: { type: "string", format: "email" },
  },
};

export const resendVerificationZod = z.object({
  email: z.string().email(),
});

export type ResendVerificationDto = z.infer<typeof resendVerificationZod>;
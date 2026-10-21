import { z } from "zod";
import { RESTRICTION_KEYS } from "@/lib/restrictions";

// Form schemas, shared by the browser forms and the server actions.

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z.string().min(8).max(72);
export const nicknameSchema = z.string().trim().max(40);

export const signupSchema = z.object({
  nickname: nicknameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const restrictionsSchema = z
  .array(z.enum(RESTRICTION_KEYS as [string, ...string[]]))
  .min(1)
  .transform((keys) => [...new Set(keys)]);

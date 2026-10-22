import { z } from "zod";
import { INGREDIENT_KEYS } from "@/lib/ingredients";
import { RESTRICTION_KEYS } from "@/lib/restrictions";

// Form schemas, shared by the browser forms and the server actions.

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z.string().min(8).max(72);
// 3–20 lower-case letters, numbers, _ or . (same rule as in the database)
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.]{3,20}$/);

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  // email or username
  identifier: z.string().trim().toLowerCase().min(1).max(254),
  password: z.string().min(1),
});

// "a, b，c" → ["a", "b", "c"] (also accepts the Chinese comma)
const listSchema = z
  .string()
  .transform((v) => v.split(/[,，]/).map((x) => x.trim()).filter(Boolean));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

export const dishSchema = z
  .object({
    name_zh: z.string().trim().min(1).max(60),
    aliases: listSchema,
    jyutping: optionalText(120),
    name_en: z.string().trim().min(1).max(120),
    description_en: optionalText(400),
    category: optionalText(40),
    source_url: z.union([z.literal(""), z.string().trim().url().max(500)]).transform((v) => v || null),
    status: z.enum(["draft", "verified"]),
    ingredients: z
      .array(z.object({ key: z.enum(INGREDIENT_KEYS as [string, ...string[]]), certainty: z.enum(["listed", "always", "usually", "sometimes"]) }))
      .transform((list) => list.filter((i, n) => list.findIndex((j) => j.key === i.key) === n)),
  })
  .refine((d) => d.status === "draft" || d.source_url, { path: ["source_url"], message: "needsSource" });

export const termSchema = z.object({
  term_zh: z.string().trim().min(1).max(30),
  variants: listSchema,
  ingredient_key: z.enum(INGREDIENT_KEYS as [string, ...string[]]),
  note: optionalText(200),
});

export const phraseSchema = z.object({
  restriction_key: z.enum(RESTRICTION_KEYS as [string, ...string[]]),
  text_zh: z.string().trim().min(1).max(200),
  jyutping: optionalText(300),
  text_en: z.string().trim().min(1).max(200),
  reviewed: z.boolean(),
});

export const restrictionsSchema = z
  .array(z.enum(RESTRICTION_KEYS as [string, ...string[]]))
  .min(1)
  .transform((keys) => [...new Set(keys)]);

# WTFood

"What's The Food?" A mobile-first web app for international students in Hong Kong: photograph a Chinese menu, kiosk screen or food label and see for every item whether it fits your dietary restrictions (OK / Check / Avoid).

Live: https://wtfood.maximilian-schiller.com

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values (Supabase dashboard → Project Settings → API Keys).
3. `npm run dev`, then open http://localhost:3000

## Project structure

| Path | What it is |
|---|---|
| `app/welcome`, `app/signup`, `app/login`, `app/forgot-password`, `app/reset-password` | Logged-out screens |
| `app/consent`, `app/restrictions` | Onboarding: consent for health data, then the restrictions picker (also used to edit them) |
| `app/(tabs)` | Screens with the bottom tab bar: Home, Scan, Lexicon, Profile |
| `app/privacy` | Public privacy notice |
| `app/auth/confirm`, `app/auth/signout` | Email links and log out |
| `app/(tabs)/lexicon` | Dish lexicon: search, dish detail with the verdict for your profile |
| `app/lab` | Lab (team only): knowledge base editor for dishes, ingredient terms and staff phrases |
| `lib/strings.ts` | **All UI text** in one place |
| `lib/restrictions.ts` | The dietary restrictions users can choose, and which ingredient categories each one rules out |
| `lib/ingredients.ts` | All ingredients with their categories (e.g. soy sauce = soy + gluten) |
| `lib/verdict.ts` | **Rule engine**: the only place that decides OK / Check / Avoid (tests in `lib/verdict.test.ts`) |
| `scripts/seed/` | Seed data: Chinese ingredient terms, about 50 dishes (drafts), Ask-staff phrases |
| `lib/validation.ts` | Form checks (zod) |
| `lib/supabase/` | Supabase clients (browser, server, admin) and the session refresh used by `proxy.ts` |
| `supabase/migrations/` | Database tables and access rules (Row Level Security) |
| `supabase/templates/` | Email templates to paste into the Supabase dashboard |

Logged-out visitors are sent to `/welcome` by `proxy.ts`. After sign-up, users must give consent and pick at least one restriction before they see the tabs.

## Database

| Command | What it does |
|---|---|
| `supabase db push` | Applies new migrations to the Supabase database |
| `npm run db:types` | Regenerates `lib/database.types.ts` after a migration |
| `npm run db:seed` | Fills the knowledge base. Ingredients are synced from `lib/ingredients.ts`; terms, dishes and phrases are only added if missing, so Lab edits are kept |
| `npm run db:team -- add <email>` | Gives an account the team role (Lab access). Also `remove <email>` and `list` |
| `npm run db:test-rls` | Checks the access rules for a logged-out visitor, a normal user and a team member (throwaway accounts) |
| `npm run db:test-user -- <email> <password>` | Creates a confirmed test account (deletes it first if it exists) |
| `npm test` | Runs the rule engine tests |

All tables from the brief exist, with Row Level Security on every table:
- Users read and change only their own profile (nickname, restrictions, consent date). Restrictions can't be stored without consent.
- Everyone logged in reads ingredients, ingredient terms, **verified** dishes and **reviewed** staff phrases.
- Only the team writes the knowledge base and reads/writes the Lab tables, feedback and study responses.
- Logged-out visitors can only submit the anonymous study.

## Rule engine

`lib/verdict.ts` turns a dish's ingredients (each with a certainty: listed, always, usually, sometimes) into a verdict for the user's restrictions:

| Situation | Verdict |
|---|---|
| Forbidden ingredient, certainty listed / always / usually | **Avoid** ("Contains peanut") |
| Forbidden ingredient, certainty sometimes | **Check** ("May contain lard") |
| Halal: meat or gelatin (slaughter unknown) | **Check** ("Ask if the chicken is halal") |
| Not recognised, no ingredients, low OCR confidence, no knowledge-base match, unknown ingredient | **Check** ("Unknown – please ask staff") |
| Otherwise | **OK** |

A model never decides OK directly.

## Hosting

- **GitHub:** `mws069/WTFood` (private). One branch and pull request per milestone.
- **Vercel:** project `wtfood` (team msk-management). Every push to `main` deploys the live version; every pull request gets a preview URL.
- **Supabase:** project `WTFood` (Frankfurt, eu-central-1). Email + password login; password reset emails via our own SMTP sender.
- **Secrets** live only in `.env.local`, the Vercel environment variables and (later) the OCR server's env file. `.env.example` lists all names without values.

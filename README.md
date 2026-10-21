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
| `lib/strings.ts` | **All UI text** in one place |
| `lib/restrictions.ts` | The dietary restrictions users can choose |
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
| `npm run db:test-user -- <email> <password>` | Creates a confirmed test account (deletes it first if it exists) |

Tables so far: `profiles` (nickname, restrictions, consent date, role). Users can only read and change their own row, and only the nickname, restrictions and consent date. Restrictions can't be stored without consent (database check).

## Hosting

- **GitHub:** `mws069/WTFood` (private). One branch and pull request per milestone.
- **Vercel:** project `wtfood` (team msk-management). Every push to `main` deploys the live version; every pull request gets a preview URL.
- **Supabase:** project `WTFood` (Frankfurt, eu-central-1). Email + password login; password reset emails via our own SMTP sender.
- **Secrets** live only in `.env.local`, the Vercel environment variables and (later) the OCR server's env file. `.env.example` lists all names without values.

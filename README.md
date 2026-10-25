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
| `lib/approaches/` | The three approaches A1, A2, A3 plus the OCR and DeepL clients |
| `lib/a3-match.ts` | A3 retrieval: nearest dishes by character-bigram similarity |
| `app/(tabs)/scan` | Scan flow, results, Ask-staff card, Report-mistake sheet |
| `scripts/seed/` | Seed data: Chinese ingredient terms, about 50 dishes (drafts), Ask-staff phrases |
| `lib/validation.ts` | Form checks (zod) |
| `lib/supabase/` | Supabase clients (browser, server, admin) and the session refresh used by `proxy.ts` |
| `supabase/migrations/` | Database tables and access rules (Row Level Security) |
| `supabase/templates/` | Email templates to paste into the Supabase dashboard |

Logged-out visitors are sent to `/welcome` by `proxy.ts`. Users log in with username or email + password. Before they see the tabs, they must have a username (older accounts pick one on their next login), give consent and pick at least one restriction.

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
- Everyone logged in reads ingredients, ingredient terms, **verified** dishes and all staff phrases (unreviewed ones are marked in the app). A3 reads draft dishes on the server.
- Only the team writes the knowledge base and reads/writes the Lab tables, feedback and study responses.
- Logged-out visitors can only submit the anonymous study.

## Scanning

1. The photo is shrunk and re-encoded as JPEG **in the browser** (`lib/resize-image.ts`), which removes EXIF/GPS data.
2. `POST /api/scan` (`app/api/scan/route.ts`) checks login, consent and the daily limit (`SCAN_DAILY_LIMIT`, default 30, table `scan_quota`).
3. One approach reads the photo: **A3 for users** (default); the team can switch to A1 or A2 on the scan screen. No approach ever sees the user's restrictions.
4. The rule engine (`lib/verdict.ts`) decides OK / Check / Avoid for each item.
5. Only anonymous numbers go to `scan_stats` (approach, kind, item count, latency, cost). **The photo is never stored.**

| Variable | What it is |
|---|---|
| `OPENAI_API_KEY` | OpenAI key (secret, server only) |
| `LLM_MODEL` | Model name, e.g. `gpt-6.1-sol` (cheaper: `gpt-6-luna`) |
| `LLM_PRICE_INPUT_PER_M` / `LLM_PRICE_OUTPUT_PER_M` | USD per 1M tokens, only for the cost statistics |
| `SCAN_DAILY_LIMIT` | Scans per user per day (default 30) |

### A2 – vision model

`lib/approaches/a2.ts` sends the photo to an OpenAI vision model (`LLM_MODEL`) with structured output; the answer is validated with zod (one retry). The model lists items and likely ingredients, also hidden ones.

### A3 – hybrid (default)

`lib/approaches/a3.ts`: OCR → one item per menu line → for each item the 3 most similar dishes of the knowledge base (character bigrams on the Chinese name and aliases, `lib/a3-match.ts`, minimum `A3_MIN_SIMILARITY`, default 0.5) → one text-only model call picks the dish that really is the item (or none) and writes name and description from that entry only. **The ingredients always come from the chosen dish entry, never from the model.** No dish similar enough, or none picked → "Not in our dish database – please ask staff" (Check). Food labels: the ingredient list is matched against `ingredient_terms` (as in A1). Draft dishes are used too; the result says "Entry not verified yet".

### Results

Each card shows the verdict with reasons; "Details" lists the ingredients and (A3) the dish entry. **Ask staff** opens a full-screen card with a question in Traditional Chinese for the user's restrictions (table `staff_phrases`; unreviewed phrases are marked "not yet checked by a native speaker"). **Report mistake** stores a short report in `feedback` (only the team can read it).

## OCR service and A1

- `ocr-service/` is a small Python service (FastAPI + PaddleOCR's PP-OCRv6 models via RapidOCR / ONNX Runtime) that returns the text lines of a photo in about 2–4 seconds. It runs on **Google Cloud Run** (project `wtfood-ocr-967027`, region us-east4), only while requests come in; a budget alert at 1 EUR/month is set. Deploy guide: `ocr-service/README.md`.
- **A1** (`lib/approaches/a1.ts`, `lib/a1-text.ts`) is the baseline without any AI model: OCR → one item per menu line (prices and titles removed) or, for labels, the ingredient list and allergen statements → DeepL translation → dictionary lookup in `ingredient_terms` (longest term first, so 魚蛋 is not 蛋). Items read with low confidence (`OCR_MIN_CONFIDENCE`, default 0.7) get "Check".
- Team members can switch between A1, A2 and A3 on the scan screen; normal users always get A3.

| Variable | What it is |
|---|---|
| `OCR_URL` | Cloud Run address of the OCR service (public) |
| `OCR_API_KEY` | Secret key the OCR service requires (same value on Cloud Run) |
| `OCR_MIN_CONFIDENCE` | Below this OCR confidence an item gets "Check" (default 0.7) |
| `DEEPL_API_KEY` | DeepL API Free key for A1 translation (secret) |
| `A3_MIN_SIMILARITY` | A3: minimum similarity for a dish match (default 0.5) |

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

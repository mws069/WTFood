# Progress log

Updated after every milestone. Newest entry on top.

## 2026-10-23 · UI clean-up

**What changed**
- **Save buttons are grey until something changes** (Lab dishes, ingredient terms, staff phrases, username, restrictions). After saving they turn grey again.
- **Home has one way to scan:** the four quick-action icons in the blue header are gone (three of them opened the same scan screen). Scanning starts from the "Snap a menu" card or the Scan button in the tab bar; menu / kiosk / label is chosen on the scan screen (milestone 4). This deviates from the brief's quick-action grid at Max's request.
- Fixed: the live app used an invalid Supabase key (sign-up failed with "401"); the keys in Vercel were replaced with the working ones.

## 2026-10-22 · Fix: missing profiles

**What happened**
- All three existing profiles had disappeared from the database (the accounts themselves still existed). Nothing in the app deletes profiles, so they were most likely removed by hand in the Supabase table view. As a result usernames like "admin" counted as free, and logged-in users were thrown out.

**What works now**
- The three profiles are restored (Max's gmail account is team again). Usernames, consent and restrictions have to be entered again on the next login.
- If a profile row is ever missing again, the app creates an empty one and the user goes through onboarding instead of being logged out.
- Unexpected sign-up errors show their error code, e.g. "Something went wrong (code). Please try again."

**Note**
- In Supabase, only change the `role` column of `profiles` by hand; deleting a row there removes the user's data. To remove a user, use Authentication → Users (or Profile → Delete account).

## 2026-10-22 · Milestone 3: Knowledge base

**What works now**
- **All database tables** from the brief (knowledge base, feedback, scan stats, Lab, study) with Row Level Security.
- **Rule engine** (`lib/verdict.ts`): turns ingredients into OK / Check / Avoid for the user's restrictions. 101 unit tests, covering every restriction, hidden ingredients (lard, oyster sauce, shrimp paste, soy sauce with wheat, cooking wine in Chinese sausage …) and "unknown → Check".
- **Restrictions** now define what they rule out (e.g. vegetarian: meat, fish, seafood, lard, gelatin; halal: pork and alcohol → Avoid, other meat → Check).
- **Seed data:** 93 ingredients, 189 Chinese ingredient terms (with Simplified variants and notes such as "牛油 = butter in Hong Kong"), **53 Hong Kong dishes as drafts** (each with a source link that was checked), 15 Ask-staff phrases (not reviewed).
- **Lexicon:** search in English, Chinese or Jyutping ("bo lo" finds 菠蘿包), every dish with its verdict for you; dish page with Chinese name, Jyutping, description, likely ingredients with certainty, reasons and source.
- **Lab (team only):** Profile → "Lab (team)". Knowledge base editor:
  - Dishes: search, filter draft/verified, edit all fields and ingredients, live preview of the verdict for every restriction, draft → verified (needs a source URL, remembers who verified).
  - Ingredient terms: add, edit, delete.
  - Staff phrases: add, edit, mark as reviewed by a local speaker.

- **New look in super-app style:** coloured icon tiles instead of emojis everywhere (icons from the open-source set lucide, ISC license). Home: blue header with greeting, search field and four white quick actions, then the Scan card, "My restrictions" as an icon grid and a tip. Profile: grouped settings list; nickname, email and delete account moved to Profile → Account. Lexicon: a category tile per dish.

- **Username instead of nickname:** every account has a unique username (3–20 letters, numbers, _ or .). Log in with **username or email**. Change it under Profile → Account. Existing nicknames that fit the rules were kept ("test", "admin"); accounts without a valid one are asked to pick a username.

**How to test**
- Lexicon tab: normal users see only verified dishes, so it's empty until the team verifies dishes. Team members see all drafts.
- Lab → Knowledge base → open a dish → check ingredients → Verified → Save. It then appears in every user's lexicon.

**Checked**
- Access test (`npm run db:test-rls`): 52/52 checks pass for logged-out visitor, normal user and team member.
- Rule engine tests (`npm test`): 101/101 pass.

**Decisions**
- No login with Google or Apple (tried, then dropped by Max): accounts stay email/username + password, as in the brief.
- The nickname became a required username (column `profiles.username`).
- Ingredients live in code (`lib/ingredients.ts`) and are copied into the database by `npm run db:seed`, so the rule engine and the database never disagree.
- Team role is set with `npm run db:team -- add <email>` (instead of an env-var allowlist).
- Tests use Node's built-in test runner, so no extra package.
- Max's account has the team role.

**Known issues / open**
- All 53 dishes are drafts: ingredients and certainties are first guesses from typical recipes. **The team must check and verify each one** (and extend to ~200).
- The Ask-staff phrases must be **checked by a local Cantonese speaker** before they are marked as reviewed.
- Some dishes link to a general Wikipedia page (e.g. "Congee", "Cantonese cuisine") because there is no page for the exact dish. Better sources are welcome.

## 2026-10-21 · Milestone 2: App shell

**What works now**
- **Welcome:** 3 intro slides (Snap the menu · We read every dish · OK, Check or Avoid) with Skip, then "Create account" or "I already have an account". Logged-out visitors always land here.
- **Sign-up** with email + password (min. 8 characters) and an optional nickname. No real name needed.
- **Login**, **Forgot password** and **Log out**. After sending the reset link the form is replaced by a "Check your inbox" message with a 1-minute countdown, then "Resend link" (or "Use a different email").
- **Consent screen** after sign-up: explains that restrictions are health data, unticked checkbox, nothing is stored before consent. The database also refuses restrictions without a consent date.
- **Restrictions picker:** 15 restrictions as chips in 3 groups (Allergies & intolerances · Diets · Religious & other), at least one required. Editable later from Home or Profile.
- **Home:** blue header with greeting, big Scan card, 5 round quick actions, "Checking for" chips, tip card.
- **Tab bar:** Home · Scan (centre) · Lexicon · Profile. Scan and Lexicon are placeholders for now.
- **Profile:** restrictions with consent date, nickname (editable), email, privacy notice, log out, **delete account** (two steps; removes the account and all data immediately).
- **Privacy notice** at `/privacy` (public): what is stored, what not, where, PDPO rights, contact wtfood@maximilian-schiller.com.
- **PWA:** app name, blue app icon (bowl with chopsticks, placeholder), installable on iPhone and Android.
- Design tokens from the brief (blue #1677FF, verdict colours, 16 px cards, pill buttons, 48 px tap targets). Font: **Manrope** (SIL Open Font License), self-hosted as small Latin-only files in `app/fonts/`.

**How to test**
- Open the preview link on your phone → slides → Create account → consent → pick restrictions → Home.
- Profile → change nickname → back on Home the greeting changes.
- Log out, then "Forgot password?" with your email → open the email → choose a new password.
- Profile → Delete account → you land on the welcome screen with a confirmation.

**Checked**
- Access rules as a normal user: sees only own profile; cannot make itself "team", cannot add or delete profiles, cannot drop consent while restrictions are stored. Logged-out visitors see nothing.

**Decisions**
- `profiles` table created now (brief: milestone 3) because consent, restrictions and delete account need it.
- Next.js "Cache Components" switched off: classic server rendering is simpler for login-protected pages.
- Email confirmation on sign-up is off during the test phase.

**Known issues / open**
- The app icon is a placeholder until we have a logo.
- "Ask staff" on Home opens the Scan placeholder; the real Ask-staff card comes in milestone 6.
- Secondary grey text (#8C8C8C from the brief) is slightly below the recommended contrast for small text; to be reviewed in milestone 9.

## 2026-10-21 · Milestone 1: Tools and accounts

**What works now**
- Empty Next.js app (Next.js 16, TypeScript, Tailwind CSS) with a WTFood placeholder page.
- Private GitHub repo `mws069/WTFood`.
- Live on Vercel: https://wtfood.maximilian-schiller.com (every push to `main` deploys automatically; every pull request gets its own preview URL).
- Supabase project `WTFood` connected: URL and keys in `.env.local` and in the Vercel environment variables. No tables yet.
- Domain `wtfood.maximilian-schiller.com` is a CNAME to Vercel; the mail records of maximilian-schiller.com are unchanged.

**How to test**
- Open https://wtfood.maximilian-schiller.com on your phone. You should see the 🥢 WTFood placeholder page.
- Locally: `npm install`, then `npm run dev`, then open http://localhost:3000.

**Decisions**
- Supabase stays in Frankfurt instead of Singapore (about 0.2 s extra per request from Hong Kong, accepted).
- Supabase uses the new key format: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`.

**Known issues / open**
- Docker is not installed yet; needed from milestone 5 (OCR service).
- Teammates still need to be invited to the GitHub repo.
- Vercel preview URLs ask for a Vercel login (Deployment Protection). Fine for now; can be switched off if teammates should open previews without a Vercel account.

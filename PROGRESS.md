# Progress log

Updated after every milestone. Newest entry on top.

## 2026-10-21 · Milestone 2: App shell

**What works now**
- **Welcome:** 3 intro slides (Snap the menu · We read every dish · OK, Check or Avoid) with Skip, then "Create account" or "I already have an account". Logged-out visitors always land here.
- **Sign-up** with email + password (min. 8 characters) and an optional nickname. No real name needed.
- **Login**, **Forgot password** (email with a link to choose a new password) and **Log out**.
- **Consent screen** after sign-up: explains that restrictions are health data, unticked checkbox, nothing is stored before consent. The database also refuses restrictions without a consent date.
- **Restrictions picker:** 15 restrictions as chips in 3 groups (Allergies & intolerances · Diets · Religious & other), at least one required. Editable later from Home or Profile.
- **Home:** blue header with greeting, big Scan card, 5 round quick actions, "Checking for" chips, tip card.
- **Tab bar:** Home · Scan (centre) · Lexicon · Profile. Scan and Lexicon are placeholders for now.
- **Profile:** restrictions with consent date, nickname (editable), email, privacy notice, log out, **delete account** (two steps; removes the account and all data immediately).
- **Privacy notice** at `/privacy` (public): what is stored, what not, where, PDPO rights, contact wtfood@maximilian-schiller.com.
- **PWA:** app name, blue app icon (bowl with chopsticks, placeholder), installable on iPhone and Android.
- Design tokens from the brief (blue #1677FF, verdict colours, 16 px cards, pill buttons, 48 px tap targets), Inter font.

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

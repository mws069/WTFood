# Progress log

Updated after every milestone. Newest entry on top.

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

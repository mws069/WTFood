# WTFood

"What's The Food?" A mobile-first web app for international students in Hong Kong: photograph a Chinese menu, kiosk screen or food label and see for every item whether it fits your dietary restrictions (OK / Check / Avoid).

Live: https://wtfood.maximilian-schiller.com

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values (Supabase dashboard → Project Settings → API Keys).
3. `npm run dev`, then open http://localhost:3000

## Hosting

- **GitHub:** `mws069/WTFood` (private). One branch and pull request per milestone.
- **Vercel:** project `wtfood` (team msk-management). Every push to `main` deploys the live version; every pull request gets a preview URL.
- **Supabase:** project `WTFood` (Frankfurt, eu-central-1).
- **Secrets** live only in `.env.local`, the Vercel environment variables and (later) the OCR server's env file. `.env.example` lists all names without values.

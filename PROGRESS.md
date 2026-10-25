# Progress log

Updated after every milestone. Newest entry on top.

## 2026-10-26 · Milestone 6b: better A3, translator, Home icons

**What works now**
- **A3 rebuilt on the photo** (Max: the OCR-based A3 gave bad titles and no descriptions): the vision model reads the photo as in A2, then each dish is matched against our dish database; with a match, the ingredients come from our entry. Without one, the AI estimate stays and "Details" says so.
- **Numbered results in menu order**, so you can count along the menu. Numbers printed on the menu are shown next to the name ("No. 12"). Every item gets a short English description.
- **Ask staff translator** (`/ask`, Home icon, and inside the card per dish):
  - You type or speak English → spoken Cantonese in big Traditional Chinese + Jyutping, "Show full screen" for the counter.
  - The staff speaks or types their answer → English.
  - Ready-made questions for your restrictions plus 6 general ones ("What ingredients are in this?", "The bill, please" …).
  - Per dish: "Suggest questions about this dish" (e.g. 西多士: peanut butter? egg batter? lard?).
- **Home:** white icon row under the search field (Scan · Lexicon · Ask staff · FAQ). Scan asks "Take photo" or "Choose from photos" and opens the scan screen with the photo.
- **FAQ page** with 9 questions; **tips and fun facts** about Cantonese food change on every visit (22 so far, `lib/tips.ts`).
- Privacy notice updated (translator, mistake reports, daily limits).

**How to test**
- Home → Scan icon → photo → results numbered 1, 2, 3 … with descriptions.
- Home → Ask staff → type or tap "Speak"; then "Staff speaks" and let someone answer in Cantonese.
- Results → "Ask staff" on a dish → "Suggest questions about this dish".

**Checked**
- Test menu with A3: 8 items in menu order, all with description, all matched to our database; 30 s.
- Translator: "I can't drink milk. Can I have the milk tea with soy milk instead?" → 我飲唔到牛奶。呢杯奶茶可唔可以用豆奶代替牛奶？; staff 可以，豆奶要加五蚊。 → "Sure. Soy milk is an extra $5."
- Speech-to-text tested on the server with English and Cantonese recordings (both recognised word for word). The microphone itself could not be tested in the desktop browser – please try on your phone.
- 129 unit tests, lint, types.

**Decisions**
- A3 = vision model + database grounding instead of OCR + text model (Max). A1 keeps OCR.
- Translator with OpenAI (Max): `gpt-6-luna` for translations (about 2× faster than `gpt-6.1-sol` with the same quality, much cheaper), `gpt-transcribe` for speech. Limit 100 translations per user per day.
- Results are in menu order (numbered) instead of sorted Avoid → Check → OK; the filter chips still show only Avoid / Check / OK.

**Known issues / open**
- A3 takes about 30 s per menu photo (vision model).
- The 21 ready-made phrases still need a check by a Cantonese speaker.
- FAQ and tips are a first draft – the team can suggest more.

## 2026-10-25 · Milestone 6: A3 hybrid, Ask staff, Report mistake

**What works now**
- **A3 – the hybrid, now the default for all users:** OCR → one item per menu line → the 3 most similar dishes of our knowledge base (character bigrams on Chinese name and aliases, threshold 0.5) → one text-only model call picks the entry that really is this dish, or none. **Ingredients always come from the chosen dish entry**, never from the model. No match → Check ("Not in our dish database – please ask staff"). Food labels: ingredient list matched against our ingredient terms.
- Results show the entry an item is based on (Details → "Based on our dish database"), with "Entry not verified yet" for drafts.
- **Ask staff** on every result card: full-screen card with the question in big Traditional Chinese, Jyutping and English; it starts with the restriction that caused the verdict and lets you switch to your other restrictions.
- **Report mistake** on every result card: optional comment, stored in `feedback` (only the team can read it; inbox in the Lab follows in milestone 8).
- Team switch on the scan screen now has A1 / A2 / A3.
- 9 new unit tests (bigram similarity, nearest dishes, no-match reason): 128 tests in total. RLS test updated (53 checks).

**How to test**
- Scan a menu (A3 is preselected) → open "Details" on a card → "Based on our dish database". Tap "Ask staff" and "Report mistake".
- Team: compare A1 / A2 / A3 on the same photo.

**Checked**
- Test menu with A3 (lactose, egg, no pork): 8 items, all matched to the right dish. 菠蘿油 → pineapple bun **with butter** → Avoid (A1 said OK), not confused with 菠蘿包. 17 s, 0.006 USD (A2: about 0.02 USD per photo).
- Ask-staff card opens on "Lactose / milk" for 菠蘿油; Report mistake saved (test row deleted again).
- Nutrition-table-only label with A3 → "Food label", Check "No ingredient list on the photo".

**Decisions**
- **Draft dishes are used by A3** (Max): only 1 of 53 dishes is verified so far. Results say "Entry not verified yet"; the quality grows as the team verifies dishes in the Lab.
- **Users see unreviewed Ask-staff phrases** (Max), with "Not yet checked by a native speaker". Database rule changed accordingly (migration `20261025000001`).
- A3 uses a text-only model call (no photo to the model): about 3× cheaper than A2.

**Known issues / open**
- A Cantonese speaker should review the 15 Ask-staff phrases (Lab → Knowledge base → Staff phrases → reviewed).
- The team should verify the 52 draft dishes and add more (target about 200); every dish not in the database is "Check" in A3.
- Feedback inbox in the Lab comes with milestone 8.

## 2026-10-25 · Milestone 5: OCR service + A1

**What works now**
- **OCR service** (`ocr-service/`): Python + FastAPI + PaddleOCR's PP-OCRv6 models (Traditional/Simplified Chinese and English), run through **RapidOCR on ONNX Runtime**: 1.5–4 s per photo on Cloud Run (2 vCPU). Health check without a key, `/ocr` only with the secret key (otherwise 401). Photos are only processed in memory.
- Runs on **Google Cloud Run** (us-east4, close to Vercel): only while someone scans, so it costs almost nothing; free trial credit, budget alert at 1 EUR per month. The first scan after a break takes 20–40 s longer while the container starts.
- **A1 – the baseline without AI:** OCR → split into items (one per menu line; for labels the ingredient list and allergen statements) → DeepL translation → dictionary lookup in our 189 ingredient terms. Only ingredients that are literally written are found ("Listed"; "may contain" → "Sometimes"). Low OCR confidence → Check.
- **Approach switch for the team** on the scan screen (A1 · OCR + dictionary / A2 · Vision model). Normal users don't see it and get A2.
- The result screen shows which approach produced it.
- Labels without a readable product name (e.g. only a nutrition table) are called "Food label" instead of a table row such as "Energy".
- 12 new unit tests for A1 (prices, titles, labels, longest-match lookup such as 魚蛋 ≠ 蛋, 牛油 ≠ beef): 119 tests in total.

**How to test (team)**
- Scan → choose "A1 · OCR + dictionary" → photo of a menu → compare with A2 on the same photo.

**Checked**
- Test menu with A1 (peanut, vegetarian, gluten): 叉燒包 → char siu, 乾炒牛河 → beef, 蠔油菜心 → oyster sauce, 咖喱魚蛋 → fish ball (not egg). As expected for the baseline, **菠蘿油 is "OK"**: the dictionary only sees 菠蘿 (pineapple) and misses flour and butter – exactly the weakness from the proposal that A2/A3 address.
- OCR service on Cloud Run: without key 401; nutrition label (30 lines) in 2.3–3.9 s, menu (16 lines) in 1.6 s, plus about 2 s upload and network.
- End to end in the app (team account, A1, lactose/egg/no pork): menu → 8 items translated by DeepL ("Char Siu Buns", "Curry Fish Balls"), 叉燒包 and 豉汁蒸排骨 → Avoid (pork); nutrition-table-only label → Check "No ingredient list on the photo – check the package".

**Decisions**
- **Google Cloud Run instead of "my own web server"** (cheapest option, < 1 USD/month). Hugging Face Spaces was planned first but now requires a paid PRO plan for Docker.
- **DeepL API Free** for A1 (1,000,000 characters per month).
- **RapidOCR instead of the Paddle engine** (Max's OK): the Paddle engine took 16–20 s per photo on Cloud Run, because its fast oneDNN mode crashes on x86 servers in Paddle 3.3. RapidOCR runs the same PP-OCR models about 10× faster with equal quality in our tests, and the container is much smaller (faster start, less storage).

**Known issues / open**
- A1 has no Jyutping and no descriptions (by design: no AI).
- The free Hugging Face account and token are no longer needed and can be deleted.

## 2026-10-25 · Milestone 4: Scan flow with A2

**What works now**
- **Scan screen** (floating Scan button or "Snap a menu"): choose Detect / Menu / Kiosk / Label, take a photo or pick one, preview, then "Check this photo".
- The photo is **shrunk on the phone** and re-encoded (removes location and camera data). It is sent to the server, checked and **never stored**.
- **A2:** an OpenAI vision model (`gpt-6.1-sol`) reads every item, translates it (菠蘿油 → "Pineapple bun with butter", not "pineapple oil"), adds Jyutping, a short description and the likely ingredients with certainty – including hidden ones (lard, oyster sauce, soy sauce with wheat, peanut butter in French toast …).
- The answer is checked against a fixed schema (zod); if it is invalid, the app asks once more, otherwise it shows a clear error.
- **The rule engine decides** OK / Check / Avoid; the model never sees the user's restrictions.
- **Processing screen** with the photo, a scanning line and three steps (Reading → Matching → Checking).
- **Results:** summary ("7 items · 1 OK · 0 Check · 6 Avoid"), filter chips, cards sorted Avoid → Check → OK with English name, Chinese, Jyutping, description and reasons; "Details" shows the ingredients with certainty; disclaimer at the bottom.
- **Daily limit:** 30 scans per user per day (`SCAN_DAILY_LIMIT`), counted on the server; users cannot read or change it.
- **Scan statistics** (anonymous): approach, kind, number of items, time and cost per scan.

- **Food labels:** the whole ingredient list (配料 / 成分) is read with certainty "Listed", allergen statements count too (含有 = listed, 可能含有 = sometimes). A photo of only a nutrition table (營養成分表) gives one item with a short nutrition summary and "Check: no ingredient list on the photo – check the package".
- **Ingredients outside our list** (e.g. palm oil, raising agent, whey powder) are shown with a **"Not verified"** label. The model also says which categories they belong to (whey powder → milk), so the rule engine still warns, with "(not verified)" in the reason.
- The model's notes are shown on the result card (e.g. what the allergen statement says).

**How to test**
- On your phone: open the preview link → Scan → take a photo of a real Chinese menu → Check this photo. Takes about 20–30 seconds.

**Checked**
- Test menu with 7 Hong Kong dishes (profile: peanut, vegetarian, gluten): all verdicts correct; only plain rice is OK. `gpt-6.1-sol` ≈ 25 s, `gpt-6-luna` ≈ 17 s with the same verdicts but fewer hidden ingredients (e.g. French toast only "may contain peanut").
- Daily limit: 3 allowed, the 4th refused; users cannot call or read it.

**Decisions**
- **OpenAI instead of Claude** (Max's decision): the `openai` package replaces `@anthropic-ai/sdk`. Model `gpt-6.1-sol` ($2 / $10 per 1M tokens, ≈ 3–4 cents per photo); `gpt-6-luna` is the cheap alternative to compare in the Lab. Note: like Claude, the OpenAI API is not officially offered in Hong Kong; our server in the US makes the calls.
- Model prices are environment variables, not code (`LLM_PRICE_INPUT_PER_M`, `LLM_PRICE_OUTPUT_PER_M`).
- Credit on the OpenAI account is prepaid without auto-recharge, so spending can never exceed the balance.

**Known issues / open**
- Ask staff and Report mistake buttons on the result cards follow in milestone 6.
- Results are not saved (no scan history, as in the brief); reloading the page loses them.

## 2026-10-23 · UI clean-up

**What changed**
- **Save buttons are grey until something changes** (Lab dishes, ingredient terms, staff phrases, username, restrictions). After saving they turn grey again.
- **Home has one way to scan:** the four quick-action icons in the blue header are gone (three of them opened the same scan screen). Scanning starts from the "Snap a menu" card or the Scan button in the tab bar; menu / kiosk / label is chosen on the scan screen (milestone 4). This deviates from the brief's quick-action grid at Max's request.
- **Tab bar with three tabs** (Home · Lexicon · Profile) and a **floating Scan button** in the bottom-right corner above the bar, so the tab labels line up again. Hidden on the scan screen itself.
- **New app icon:** glowing blue gradient, scan frame around the bowl with chopsticks and a gradient "AI" badge. On the iPhone, remove and re-add the app to the Home Screen to see it.
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

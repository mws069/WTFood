// Creates (or recreates) a confirmed test account for local testing.
// Usage: npm run db:test-user -- <email> <password>
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error("Usage: test-user.mts <email> <password>");

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});

const { data: list } = await admin.auth.admin.listUsers();
const existing = list?.users.find((u) => u.email === email);
if (existing) await admin.auth.admin.deleteUser(existing.id);

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { username: email.split("@")[0].replace(/[^a-z0-9_.]/g, "").slice(0, 20) },
});
if (error) throw error;
console.log(`Created ${data.user.email}`);

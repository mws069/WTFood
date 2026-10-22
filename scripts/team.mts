// Gives accounts the team role (access to the Lab), or takes it away.
// Usage: npm run db:team -- add alice@example.com bob@example.com
//        npm run db:team -- remove alice@example.com
//        npm run db:team -- list
// The account must exist (sign up in the app first).
import { createClient } from "@supabase/supabase-js";

const [action, ...emails] = process.argv.slice(2);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});

const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;
const byEmail = new Map(data.users.map((u) => [u.email?.toLowerCase(), u.id]));

if (action === "list") {
  const { data: team } = await db.from("profiles").select("id").eq("role", "team");
  const ids = new Set((team ?? []).map((p) => p.id));
  const members = data.users.filter((u) => ids.has(u.id)).map((u) => u.email);
  console.log(members.length ? `Team: ${members.join(", ")}` : "No team members yet.");
} else if ((action === "add" || action === "remove") && emails.length) {
  for (const email of emails) {
    const id = byEmail.get(email.toLowerCase());
    if (!id) {
      console.log(`${email}: no account found (sign up in the app first)`);
      continue;
    }
    const { error } = await db.from("profiles").update({ role: action === "add" ? "team" : "user" }).eq("id", id);
    console.log(error ? `${email}: ${error.message}` : `${email}: ${action === "add" ? "now team" : "now normal user"}`);
  }
} else {
  console.log("Usage: npm run db:team -- add|remove <email…>   or   npm run db:team -- list");
}

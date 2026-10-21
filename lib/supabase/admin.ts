import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Admin client with the secret key: bypasses Row Level Security.
// SERVER ONLY: never import this from a Client Component.
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

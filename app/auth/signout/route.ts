import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/welcome", request.nextUrl.origin), { status: 303 });
}

// Used when a session belongs to an account that no longer exists
// (see lib/profile.ts): sign out and explain why on the login page.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login?error=session", request.nextUrl.origin));
}

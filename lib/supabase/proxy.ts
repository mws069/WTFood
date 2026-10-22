import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

// Pages anyone can open without being logged in.
const PUBLIC_PATHS = ["/welcome", "/signup", "/login", "/forgot-password", "/privacy"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/");
}

// Refreshes the Supabase session cookie on every request and sends
// logged-out visitors to the welcome screen.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not add code between createServerClient and getClaims():
  // it would make random logouts hard to debug.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell, FormMessage } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";
import { s } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

const ERRORS: Record<string, string> = {
  link: s.login.linkError,
  oauth: s.login.oauthError,
  session: s.login.sessionEnded,
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/");

  const { error } = await searchParams;
  const errorText = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <AuthShell title={s.login.title}>
      {errorText && <FormMessage kind="error" text={errorText} />}
      <LoginForm />
      <OAuthButtons />
      <div className="flex flex-col items-center gap-3 text-sm">
        <Link href="/forgot-password" className="link">
          {s.login.forgot}
        </Link>
        <Link href="/signup" className="link">
          {s.login.noAccount}
        </Link>
      </div>
    </AuthShell>
  );
}

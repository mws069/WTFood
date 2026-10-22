import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";
import { s } from "@/lib/strings";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AuthShell title={s.signup.title} intro={s.signup.intro}>
      <SignupForm />
      <OAuthButtons />
      <p className="text-center text-sm">
        <Link href="/login" className="link">
          {s.signup.haveAccount}
        </Link>
      </p>
    </AuthShell>
  );
}

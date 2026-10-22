import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title={s.forgot.title} intro={s.forgot.intro}>
      <ForgotForm />
      <p className="text-center text-sm">
        <Link href="/login" className="link">
          {s.forgot.backToLogin}
        </Link>
      </p>
    </AuthShell>
  );
}

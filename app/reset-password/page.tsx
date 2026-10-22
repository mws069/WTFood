import { AuthShell } from "@/components/auth-shell";
import { s } from "@/lib/strings";
import { ResetForm } from "./reset-form";

// The reset link from the email signs the user in (via /auth/confirm) and
// lands here. Logged-out visitors are sent to /welcome by the proxy.
export default function ResetPasswordPage() {
  return (
    <AuthShell title={s.reset.title} intro={s.reset.intro}>
      <ResetForm />
    </AuthShell>
  );
}

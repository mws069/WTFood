import { redirect } from "next/navigation";
import { TabBar } from "@/components/tab-bar";
import { getCurrentProfile, onboardingStep } from "@/lib/profile";

// Everything with the bottom tab bar. Users who haven't finished
// onboarding (consent, restrictions) are sent there first.
export default async function TabsLayout({ children }: LayoutProps<"/">) {
  const profile = await getCurrentProfile();
  const step = onboardingStep(profile);
  if (step) redirect(step);

  return (
    <>
      <div className="flex flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</div>
      <TabBar />
    </>
  );
}

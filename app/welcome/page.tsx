import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Slides } from "./slides";

// First screen for logged-out visitors: three short intro slides.
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/");

  const { deleted } = await searchParams;
  return <Slides deleted={deleted === "1"} />;
}

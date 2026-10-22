import { s } from "@/lib/strings";
import { KnowledgeTabs } from "./tabs";

export default function KnowledgeLayout({ children }: LayoutProps<"/lab/knowledge">) {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight">{s.lab.knowledgeBase}</h1>
      <KnowledgeTabs />
      {children}
    </>
  );
}

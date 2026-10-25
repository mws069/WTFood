import { KINDS, type Kind } from "@/lib/scan-schema";
import { ScanFlow } from "./scan-flow";

export default async function ScanPage({ searchParams }: PageProps<"/scan">) {
  const { kind } = await searchParams;
  const initialKind = KINDS.includes(kind as Kind) ? (kind as Kind) : null;
  return <ScanFlow initialKind={initialKind} limit={Number(process.env.SCAN_DAILY_LIMIT) || 30} />;
}

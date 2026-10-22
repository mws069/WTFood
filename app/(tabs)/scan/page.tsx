import { Camera } from "lucide-react";
import { Placeholder } from "@/components/placeholder";
import { s } from "@/lib/strings";

export default function ScanPage() {
  return <Placeholder title={s.scan.title} text={s.scan.text} icon={Camera} color="blue" />;
}

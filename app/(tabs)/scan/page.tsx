import { CameraIcon } from "@/components/icons";
import { Placeholder } from "@/components/placeholder";
import { s } from "@/lib/strings";

export default function ScanPage() {
  return <Placeholder title={s.scan.title} text={s.scan.text} icon={<CameraIcon size={40} />} />;
}

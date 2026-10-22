import { BookIcon } from "@/components/icons";
import { Placeholder } from "@/components/placeholder";
import { s } from "@/lib/strings";

export default function LexiconPage() {
  return <Placeholder title={s.lexicon.title} text={s.lexicon.text} icon={<BookIcon size={40} />} />;
}

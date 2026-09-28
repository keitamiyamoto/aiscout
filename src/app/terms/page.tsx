import { LegalDocument } from "@/components/LegalDocument";
import { TERMS } from "@/content/legal";

export const metadata = { title: "利用規約" };

export default function TermsPage() {
  return <LegalDocument doc={TERMS} />;
}

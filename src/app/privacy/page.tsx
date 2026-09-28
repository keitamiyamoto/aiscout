import { LegalDocument } from "@/components/LegalDocument";
import { PRIVACY } from "@/content/legal";

export const metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY} />;
}

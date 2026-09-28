import Link from "next/link";
import { COMPANY } from "@/content/legal";

export function Footer() {
  return (
    <footer className="border-t border-sand-200 py-6 text-center text-xs text-ink-500">
      <p>
        <Link href="/terms" className="hover:underline">
          利用規約
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:underline">
          プライバシーポリシー
        </Link>
      </p>
      <p className="mt-2">
        運営: {COMPANY.name} (有料職業紹介事業 許可番号 {COMPANY.licenseNumber})
      </p>
    </footer>
  );
}

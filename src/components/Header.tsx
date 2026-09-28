import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

export function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-sand-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="トップへ">
          <Logo size="md" />
        </Link>
        {right}
      </div>
    </header>
  );
}

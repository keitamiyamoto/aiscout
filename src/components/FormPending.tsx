"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";
import { BusyOverlay, Button } from "@/components/ui";

/** form の action 実行中にマスクを出す。<form> の中に置く。 */
export function FormBusy({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <BusyOverlay show={pending} label={label} />;
}

/** form 送信ボタン。送信中は無効化してラベルを変える。 */
export function SubmitButton({ pendingLabel, children, ...rest }: ComponentProps<typeof Button> & { pendingLabel: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" {...rest} disabled={pending || rest.disabled}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

function LinkInner({ children, pendingLabel, busyLabel }: { children: ReactNode; pendingLabel?: string; busyLabel: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? (pendingLabel ?? children) : children}
      <BusyOverlay show={pending} label={busyLabel} />
    </>
  );
}

/** ページ遷移中にマスクを出すリンクボタン */
export function NavButton({
  href,
  children,
  busyLabel = "読み込み中…",
  pendingLabel,
  variant,
  size,
  className,
}: {
  href: string;
  children: ReactNode;
  busyLabel?: string;
  pendingLabel?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <Button variant={variant} size={size} tabIndex={-1}>
        <LinkInner busyLabel={busyLabel} pendingLabel={pendingLabel}>
          {children}
        </LinkInner>
      </Button>
    </Link>
  );
}

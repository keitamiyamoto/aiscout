import { BRAND } from "@/lib/brand";

/** ロゴマーク: 笑顔の虫めがね (スカウト) + 上向き矢印 (年収アップ) + きらめき。 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M30.5 31.5l9.5 9.5" stroke="#1B2A41" strokeWidth="5" strokeLinecap="round" />
      <path d="M30.5 31.5l9.5 9.5" stroke="#1E7A5A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="21" r="14.5" fill="#FFFFFF" stroke="#1B2A41" strokeWidth="2.6" />
      <circle cx="15.5" cy="19" r="1.9" fill="#1B2A41" />
      <circle cx="24.5" cy="19" r="1.9" fill="#1B2A41" />
      <path d="M14.5 24.5c2.4 3 8.6 3 11 0" stroke="#1B2A41" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="12" cy="23.5" r="1.6" fill="#F2B33D" opacity="0.85" />
      <circle cx="28" cy="23.5" r="1.6" fill="#F2B33D" opacity="0.85" />
      <path d="M38.5 16V5.5M34.5 9.5l4-4 4 4" stroke="#1E7A5A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 23l1.3 2.9 2.9 1.3-2.9 1.3L44 31.4l-1.3-2.9-2.9-1.3 2.9-1.3z" fill="#F2B33D" />
      <path d="M5 38l1 2.2 2.2 1-2.2 1L5 44.4l-1-2.2-2.2-1 2.2-1z" fill="#1E7A5A" opacity="0.9" />
    </svg>
  );
}

/** ロゴマーク + ワードマーク */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? 56 : size === "md" ? 36 : 28;
  const word = size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-base";
  const kicker = size === "lg" ? "text-sm" : "text-[10px]";
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={mark} />
      <span className="flex flex-col leading-none">
        <span className={`${kicker} font-bold tracking-[0.18em] text-leaf-700`}>{BRAND.kicker}</span>
        <span className={`${word} font-display font-bold tracking-tight text-ink-900`}>{BRAND.shortName}</span>
      </span>
    </span>
  );
}

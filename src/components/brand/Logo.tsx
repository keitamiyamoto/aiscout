import { BRAND } from "@/lib/brand";

/** ロゴマーク: 調べるくんの顔 (スカウターつき) */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M24 6c11 0 18 8 18 19s-7 18-18 18S6 36 6 25 13 6 24 6z" fill="#CFE8FA" stroke="#1D4F7C" strokeWidth="2.6" />
      <ellipse cx="17.5" cy="23" rx="2" ry="2.6" fill="#1D4F7C" />
      <rect x="24" y="17" width="12" height="11" rx="3.4" fill="#FFE500" fillOpacity="0.7" stroke="#1D4F7C" strokeWidth="2.2" />
      <ellipse cx="30" cy="22.5" rx="2" ry="2.6" fill="#1D4F7C" />
      <path d="M36 21h4v8" stroke="#1D4F7C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 17V9" stroke="#1D4F7C" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="40" cy="7.5" r="2.2" fill="#FFE500" stroke="#1D4F7C" strokeWidth="1.8" />
      <path d="M19 32c2.5 3 7.5 3 10 0" stroke="#1D4F7C" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** ロゴマーク + ワードマーク */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? 56 : size === "md" ? 38 : 30;
  const word = size === "lg" ? "text-2xl" : size === "md" ? "text-base sm:text-lg" : "text-sm";
  const kicker = size === "lg" ? "text-sm" : "text-[10px]";
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={mark} />
      <span className="flex flex-col leading-none">
        <span className={`${kicker} font-black tracking-[0.2em] text-leaf-600`}>{BRAND.kicker}</span>
        <span className={`${word} mt-1 font-black tracking-tight text-ink-900`}>{BRAND.shortName}</span>
      </span>
    </span>
  );
}

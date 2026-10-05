"use client";

import type { ReactNode } from "react";
import type { Opt } from "@/lib/questions";

/** 1つ選ぶ質問は丸、複数選べる質問は四角のチェック */
function Check({ on, square }: { on: boolean; square?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-6 w-6 shrink-0 place-items-center border-2 transition ${square ? "rounded-md" : "rounded-full"} ${on ? "border-leaf-600 bg-leaf-600 text-white" : "border-sand-300 bg-white text-transparent"}`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function ChoiceButton({ on, onClick, children, sub, role = "radio" }: { on: boolean; onClick: () => void; children: ReactNode; sub?: string; role?: "radio" | "checkbox" }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.99] ${
        on ? "border-leaf-600 bg-leaf-50 " : "border-sand-200 bg-white hover:border-leaf-600/40 hover:bg-sand-50"
      }`}
    >
      <Check on={on} square={role === "checkbox"} />
      <span className="min-w-0">
        <span className="block font-semibold text-ink-900">{children}</span>
        {sub && <span className="mt-0.5 block text-xs text-ink-500">{sub}</span>}
      </span>
    </button>
  );
}

export function SingleChoice({ options, value, onPick, columns = 1 }: { options: readonly Opt[]; value: string | undefined; onPick: (v: string) => void; columns?: 1 | 2 }) {
  return (
    <div role="radiogroup" className={`grid gap-2.5 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {options.map((o) => (
        <ChoiceButton key={o.value} on={value === o.value} onClick={() => onPick(o.value)} sub={o.sub}>
          {o.label}
        </ChoiceButton>
      ))}
    </div>
  );
}

export function MultiChoice({
  options,
  values,
  onChange,
  noneValue,
  max,
}: {
  options: readonly Opt[];
  values: string[];
  onChange: (v: string[]) => void;
  noneValue?: string;
  max?: number;
}) {
  const toggle = (v: string) => {
    if (values.includes(v)) return onChange(values.filter((x) => x !== v));
    if (v === noneValue) return onChange([v]);
    const next = [...values.filter((x) => x !== noneValue), v];
    if (max && next.length > max) return;
    onChange(next);
  };
  return (
    <div role="group" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const on = values.includes(o.value);
        const disabled = !on && Boolean(max) && values.filter((x) => x !== noneValue).length >= (max ?? 0) && o.value !== noneValue;
        return (
          <div key={o.value} className={disabled ? "opacity-45" : ""}>
            <ChoiceButton role="checkbox" on={on} onClick={() => toggle(o.value)} sub={o.sub}>
              {o.label}
            </ChoiceButton>
          </div>
        );
      })}
    </div>
  );
}

/** 小さいピル型の選択肢 (都道府県・時間帯など数が多いもの) */
export function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${on ? "border-leaf-600 bg-leaf-600 text-white " : "border-sand-300 bg-white text-ink-700 hover:border-ink-300"}`}
    >
      {children}
    </button>
  );
}

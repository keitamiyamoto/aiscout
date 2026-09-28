"use client";

import { PREFECTURE_REGIONS, type Opt } from "@/lib/questions";
import { Pill } from "@/components/diagnosis/Choices";

const fill = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;

export function IncomeSlider({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v / step) * step)));
  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft sm:p-7">
      <p className="text-center text-sm font-semibold text-ink-500">年収 (税込)</p>
      <p className="mt-1 text-center font-display font-bold text-ink-900" aria-live="polite">
        <span className="text-5xl tabular-nums sm:text-6xl">{value.toLocaleString("ja-JP")}</span>
        <span className="ml-1 text-xl">万円{value >= max ? "以上" : ""}</span>
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={() => set(value - step)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sand-300 bg-white text-xl font-bold text-ink-700 hover:bg-sand-50" aria-label={`${step}万円下げる`}>
          −
        </button>
        <input
          type="range"
          className="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => set(Number(e.target.value))}
          style={{ "--fill": fill(value, min, max) } as React.CSSProperties}
          aria-label="年収 (万円)"
        />
        <button type="button" onClick={() => set(value + step)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sand-300 bg-white text-xl font-bold text-ink-700 hover:bg-sand-50" aria-label={`${step}万円上げる`}>
          ＋
        </button>
      </div>
      <div className="mt-1 flex justify-between px-14 text-xs text-ink-500">
        <span>{min}万円</span>
        <span>{max.toLocaleString("ja-JP")}万円以上</span>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {[250, 300, 400, 500, 600, 800].map((v) => (
          <Pill key={v} on={value === v} onClick={() => set(v)}>
            {v}万円
          </Pill>
        ))}
      </div>
    </div>
  );
}

export function PrefecturePicker({ value, onPick }: { value: string | undefined; onPick: (v: string) => void }) {
  return (
    <div className="space-y-5">
      {PREFECTURE_REGIONS.map((r) => (
        <div key={r.region}>
          <p className="mb-2 text-xs font-bold tracking-wider text-ink-500">{r.region}</p>
          <div className="flex flex-wrap gap-2">
            {r.list.map((p) => (
              <Pill key={p} on={value === p} onClick={() => onPick(p)}>
                {p}
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkillLevels({ items, scale, values, onChange }: { items: readonly Opt[]; scale: readonly string[]; values: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  const max = scale.length - 1;
  return (
    <div className="divide-y divide-sand-200 rounded-3xl border border-sand-200 bg-white px-5 shadow-soft">
      {items.map((it) => {
        const v = values[it.value] ?? 0;
        return (
          <div key={it.value} className="py-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-ink-900">{it.label}</span>
              <span className={`text-sm font-bold tabular-nums ${v > 0 ? "text-leaf-700" : "text-ink-300"}`}>
                {v}
                <span className="ml-1.5 text-xs font-medium">{scale[v]}</span>
              </span>
            </div>
            <input
              type="range"
              className="range range-sm mt-1"
              min={0}
              max={max}
              step={1}
              value={v}
              onChange={(e) => onChange({ ...values, [it.value]: Number(e.target.value) })}
              style={{ "--fill": fill(v, 0, max) } as React.CSSProperties}
              aria-label={`${it.label} (0〜${max})`}
              aria-valuetext={`${v} ${scale[v]}`}
            />
            <div className="flex justify-between text-[11px] text-ink-300">
              <span>0 {scale[0]}</span>
              <span>
                {max} {scale[max]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

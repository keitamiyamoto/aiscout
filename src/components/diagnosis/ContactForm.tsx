"use client";

import Link from "next/link";
import { Field, Input } from "@/components/ui";
import { Pill } from "@/components/diagnosis/Choices";
import { OPTIONS } from "@/lib/questions";
import type { ContactDraft } from "@/lib/schemas";

export function ContactForm({
  value: v,
  onChange,
  errors,
  honeypot,
  onHoneypot,
}: {
  value: ContactDraft;
  onChange: (next: ContactDraft) => void;
  errors: Record<string, string>;
  honeypot: string;
  onHoneypot: (v: string) => void;
}) {
  const set = (patch: Partial<ContactDraft>) => onChange({ ...v, ...patch });
  const toggleTime = (t: string) => {
    if (t === "anytime") return set({ contactTimes: v.contactTimes.includes(t) ? [] : [t] });
    const rest = v.contactTimes.filter((x) => x !== "anytime");
    set({ contactTimes: rest.includes(t) ? rest.filter((x) => x !== t) : [...rest, t] });
  };

  return (
    <div className="space-y-5 rounded-lg border border-sand-200 bg-white p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="お名前" required error={errors.name}>
          <Input name="name" autoComplete="name" value={v.name} onChange={(e) => set({ name: e.target.value })} placeholder="山田 太郎" />
        </Field>
        <Field label="ふりがな" required error={errors.nameKana}>
          <Input name="nameKana" value={v.nameKana} onChange={(e) => set({ nameKana: e.target.value })} placeholder="やまだ たろう" />
        </Field>
      </div>
      <Field label="電話番号" required error={errors.phone} hint="ハイフンなしでもOKです">
        <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="09012345678" />
      </Field>
      <Field label="メールアドレス" required error={errors.email}>
        <Input name="email" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" />
      </Field>
      <div>
        <p className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink-700">
          連絡のつきやすい時間帯<span className="text-coral-600">*</span>
          <span className="ml-1 text-xs font-normal text-ink-500">(複数選択可)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.contactTimes.map((o) => (
            <Pill key={o.value} on={v.contactTimes.includes(o.value)} onClick={() => toggleTime(o.value)}>
              {o.label}
            </Pill>
          ))}
        </div>
        {errors.contactTimes && <p className="mt-1.5 text-xs font-medium text-coral-600">{errors.contactTimes}</p>}
      </div>

      {/* ボット対策 (画面には表示しない) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(e) => onHoneypot(e.target.value)} />
        </label>
      </div>

      <label className="flex items-start gap-2.5 rounded-lg bg-sand-50 p-4 text-sm leading-relaxed text-ink-900">
        <input type="checkbox" name="consent" checked={v.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-1 h-4 w-4 accent-leaf-600" />
        <span>
          <Link href="/terms" target="_blank" className="font-semibold text-leaf-700 underline">
            利用規約
          </Link>
          と
          <Link href="/privacy" target="_blank" className="font-semibold text-leaf-700 underline">
            プライバシーポリシー
          </Link>
          に同意し、診断結果をもとにキャリアアドバイザーから電話・メール等でご連絡を受け取ることに同意します
        </span>
      </label>
      {errors.consent && <p className="-mt-3 text-xs font-medium text-coral-600">{errors.consent}</p>}
    </div>
  );
}

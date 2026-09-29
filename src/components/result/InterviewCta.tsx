"use client";

import { useState, useTransition } from "react";
import { BusyOverlay, Button, Textarea } from "@/components/ui";
import { Pill } from "@/components/diagnosis/Choices";
import { requestInterviewAction } from "@/app/actions/diagnosis";
import { OPTIONS } from "@/lib/questions";
import { BRAND } from "@/lib/brand";
import { MAX_INTERVIEW_DATES, formatInterviewDate, type CandidateDate } from "@/lib/interview-dates";

const MERITS = [
  { title: "無理に転職を勧めません", body: "「まだ迷っている」段階でも大丈夫。情報収集だけでもOKです。" },
  { title: "オンラインで30分", body: "ご自宅からスマホでOK。顔出しなしでも参加できます。" },
  { title: "非公開求人もご紹介", body: "診断結果をもとに、あなたに合う求人をピックアップします。" },
  { title: "年収交渉も代行", body: "市場価値をふまえて、条件交渉までサポートします。" },
];

/** 公式LINE へのボタン */
export function LineButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={BRAND.lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-6 py-3.5 font-black text-white transition hover:brightness-95 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9l-.6 2.6c-.1.4.3.7.7.5l3.4-2.4C18.9 19.2 22 15.5 22 11c0-4.4-4.5-8-10-8z" fill="#fff" />
        <path d="M7 9v4h2.2M10.8 9v4M12.8 13V9l2.6 4V9M19 9h-2.3v4H19M16.7 11H19" stroke="#06C755" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      まずは公式LINEで質問してみる
    </a>
  );
}

export function InterviewCta({ token, name, phone, requested, dates }: { token: string; name: string; phone: string; requested: boolean; dates: CandidateDate[] }) {
  const [done, setDone] = useState<string[] | true | null>(requested ? true : null);
  const [picked, setPicked] = useState<string[]>([]);
  const [time, setTime] = useState<string>("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const toggle = (v: string) => {
    setError(null);
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : p.length >= MAX_INTERVIEW_DATES ? p : [...p, v]));
  };

  const submit = () => {
    if (picked.length === 0) return setError("ご希望の日付を1つ以上選んでください");
    if (!time) return setError("ご希望の時間帯を選んでください");
    start(async () => {
      setError(null);
      const res = await requestInterviewAction(token, { dates: picked, time, note });
      if (res.ok) setDone(picked);
      else setError(res.fieldErrors ? Object.values(res.fieldErrors)[0] : res.error);
    });
  };

  if (done) {
    return (
      <div className="pop-in rounded-md border-2 border-leaf-600 bg-leaf-50 p-6 text-center sm:p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-600 text-2xl text-white">✓</span>
        <p className="mt-4 text-xl font-black text-ink-900">オンラインのカジュアル面談のお申し込みを受け付けました</p>
        {Array.isArray(done) && (
          <p className="mt-3 text-sm font-bold text-ink-900">
            ご希望日：{[...done].sort().map(formatInterviewDate).join("・")}
            {time && `（${OPTIONS.interviewTime.find((o) => o.value === time)?.label ?? ""}）`}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          {name}さん、ありがとうございます。担当のキャリアアドバイザーから<strong>{BRAND.contactLeadTime}</strong>に
          <br className="hidden sm:inline" />
          <span className="font-bold">{phone || "ご登録の電話番号"}</span> へ、日時の確定とオンライン面談のURLをご連絡します。
        </p>
        <p className="mt-3 text-xs text-ink-500">知らない番号からの着信になる場合があります。出られなかった場合はSMSでもご連絡します。</p>
        <div className="mx-auto mt-6 max-w-sm">
          <p className="mb-2 text-xs font-bold text-ink-700">面談の前に聞きたいことがあれば</p>
          <LineButton />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border-2 border-leaf-600 bg-white">
      <BusyOverlay show={pending} label="送信しています…" />
      <div className="bg-sun-100 px-6 py-6 sm:px-8">
        <p className="text-sm font-black text-leaf-700">無料・オンラインで30分</p>
        <p className="mt-1 text-2xl font-black leading-snug text-ink-900">まずはカジュアル面談してみませんか？</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">診断結果をもとに、キャリアアドバイザーがあなたの市場価値の活かし方や、向いている仕事の具体的な求人をご紹介します。</p>
      </div>
      <div className="space-y-7 px-5 py-6 sm:px-8">
        <ul className="grid gap-3 sm:grid-cols-2">
          {MERITS.map((m) => (
            <li key={m.title} className="flex gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-[11px] font-bold text-leaf-800">✓</span>
              <span>
                <span className="block text-sm font-bold text-ink-900">{m.title}</span>
                <span className="block text-xs text-ink-500">{m.body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div>
          <p className="flex items-baseline justify-between gap-2 text-sm font-black text-ink-900">
            <span>
              ご希望の日付<span className="text-coral-600">*</span>
            </span>
            <span className="text-xs font-bold text-ink-500">第{MAX_INTERVIEW_DATES}希望まで選べます</span>
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-label="ご希望の日付">
            {dates.map((d) => {
              const rank = picked.indexOf(d.value);
              const on = rank >= 0;
              const full = !on && picked.length >= MAX_INTERVIEW_DATES;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggle(d.value)}
                  aria-pressed={on}
                  aria-label={`${formatInterviewDate(d.value)}${on ? ` 第${rank + 1}希望` : ""}`}
                  disabled={full}
                  className={`relative rounded-md border-2 px-1 pb-2 pt-3 text-center transition disabled:opacity-40 ${on ? "border-leaf-600 bg-leaf-600 text-white" : "border-sand-200 bg-white hover:border-leaf-600/50"}`}
                >
                  {on && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-sun-500 px-1.5 text-[10px] font-black leading-4 text-ink-900">第{rank + 1}希望</span>}
                  <span className={`block text-[11px] font-bold ${on ? "text-white/85" : "text-ink-500"}`}>{d.month}月</span>
                  <span className="block text-xl font-black leading-tight">{d.day}</span>
                  <span className={`block text-xs font-bold ${on ? "text-white" : d.weekday === "日" ? "text-coral-600" : d.weekday === "土" ? "text-leaf-600" : "text-ink-700"}`}>({d.weekday})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-black text-ink-900">
            ご希望の時間帯<span className="text-coral-600">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.interviewTime.map((o) => (
              <Pill key={o.value} on={time === o.value} onClick={() => setTime(o.value)}>
                {o.label}
              </Pill>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-black text-ink-900">
            相談したいこと <span className="text-xs font-normal text-ink-500">(任意)</span>
          </span>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例: 未経験からITエンジニアに挑戦できるか相談したい" maxLength={500} />
        </label>

        {error && <p className="rounded-md bg-coral-100/60 px-4 py-3 text-sm font-bold text-coral-700">{error}</p>}

        <div className="space-y-3">
          <Button variant="accent" size="lg" className="w-full !px-3 text-[15px] sm:text-base" onClick={submit} disabled={pending}>
            {pending ? "送信中…" : "無料でオンラインのカジュアル面談してみる"}
          </Button>
          <p className="text-center text-xs text-ink-500">日時の確定とURLは、ご登録の電話番号{phone ? ` (${phone})` : ""}へご連絡します</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-ink-500" aria-hidden="true">
          <span className="h-px flex-1 bg-sand-200" />
          面談の前に、気軽に聞いてみたい方は
          <span className="h-px flex-1 bg-sand-200" />
        </div>
        <LineButton />
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { BusyOverlay, Button, Textarea } from "@/components/ui";
import { Pill } from "@/components/diagnosis/Choices";
import { requestInterviewAction } from "@/app/actions/diagnosis";
import { OPTIONS } from "@/lib/questions";
import { BRAND } from "@/lib/brand";

const MERITS = [
  { title: "無理に転職を勧めません", body: "「まだ迷っている」段階でも大丈夫。情報収集だけでもOKです。" },
  { title: "30分・オンラインでも", body: "電話・オンライン・LINE通話からお選びいただけます。" },
  { title: "非公開求人もご紹介", body: "診断結果をもとに、あなたに合う求人をピックアップします。" },
  { title: "年収交渉も代行", body: "市場価値をふまえて、条件交渉までサポートします。" },
];

export function InterviewCta({ token, name, phone, requested }: { token: string; name: string; phone: string; requested: boolean }) {
  const [done, setDone] = useState(requested);
  const [method, setMethod] = useState<string>("phone");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setError(null);
      const res = await requestInterviewAction(token, { method, note });
      if (res.ok) setDone(true);
      else setError(res.fieldErrors ? Object.values(res.fieldErrors)[0] : res.error);
    });

  if (done) {
    return (
      <div className="pop-in rounded-md border-2 border-leaf-600 bg-leaf-50 p-6 text-center sm:p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-600 text-2xl text-white">✓</span>
        <p className="mt-4 font-display text-xl font-bold text-ink-900">カジュアル面談のお申し込みを受け付けました</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          {name}さん、ありがとうございます。担当のキャリアアドバイザーから<strong>{BRAND.contactLeadTime}</strong>に
          <br className="hidden sm:inline" />
          <span className="font-semibold">{phone || "ご登録の電話番号"}</span> へご連絡します。
        </p>
        <p className="mt-3 text-xs text-ink-500">知らない番号からの着信になる場合があります。出られなかった場合はSMSでもご連絡します。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border-2 border-leaf-600 bg-white">
      <BusyOverlay show={pending} label="送信しています…" />
      <div className="bg-sun-100 px-6 py-6 sm:px-8">
        <p className="text-sm font-bold text-leaf-700">無料・最短30分</p>
        <p className="mt-1 font-display text-2xl font-bold leading-snug text-ink-900">まずはカジュアル面談してみませんか？</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">診断結果をもとに、キャリアアドバイザーがあなたの市場価値の活かし方や、向いている仕事の具体的な求人をご紹介します。</p>
      </div>
      <div className="space-y-6 px-6 py-6 sm:px-8">
        <ul className="grid gap-3 sm:grid-cols-2">
          {MERITS.map((m) => (
            <li key={m.title} className="flex gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-100 text-[11px] font-bold text-leaf-800">✓</span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">{m.title}</span>
                <span className="block text-xs text-ink-500">{m.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">ご希望の面談方法</p>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.interviewMethod.map((o) => (
              <Pill key={o.value} on={method === o.value} onClick={() => setMethod(o.value)}>
                {o.label}
              </Pill>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">
            相談したいこと <span className="text-xs font-normal text-ink-500">(任意)</span>
          </span>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例: 未経験からITエンジニアに挑戦できるか相談したい" maxLength={500} />
        </label>
        {error && <p className="rounded-lg bg-coral-100/60 px-4 py-3 text-sm font-medium text-coral-700">{error}</p>}
        <Button variant="accent" size="lg" className="w-full" onClick={submit} disabled={pending}>
          {pending ? "送信中…" : "無料でカジュアル面談を申し込む"}
        </Button>
        <p className="text-center text-xs text-ink-500">ご登録の電話番号{phone ? ` (${phone})` : ""}に担当者からご連絡します</p>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { diagnose } from "@/lib/engine";
import { answersSchema, type AnswersDraft } from "@/lib/schemas";

/**
 * 連絡先の入力の前に、診断結果の一部 (想定年収の幅と同年代での位置) を先に見せる。
 * 計算は engine.ts の純粋関数をブラウザで動かすだけで、サーバーには何も送らない。
 * 向いている職種トップ3と詳しい解説は、連絡先の入力後 (結果ページ) で表示する。
 */
export function ResultTeaser({ answers }: { answers: AnswersDraft }) {
  const result = useMemo(() => {
    const parsed = answersSchema.safeParse(answers);
    return parsed.success ? diagnose(parsed.data) : null;
  }, [answers]);
  if (!result) return null;

  return (
    <div className="overflow-hidden rounded-md border-2 border-leaf-600 bg-white">
      <div className="bg-leaf-50 px-4 py-4 text-center">
        <p className="text-xs font-bold text-leaf-700">あなたの市場価値（想定年収の目安）</p>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums text-ink-900 sm:text-4xl">
          {result.low}〜{result.high}
          <span className="ml-1 text-base">万円</span>
        </p>
        {/* 「上位◯%」は同年代の上半分のときだけ出す (下半分だと連絡先の入力をためらわせるため) */}
        {result.topPercent !== undefined && result.topPercent <= 50 && (
          <p className="mt-1 text-sm text-ink-700">
            同年代の中で <span className="font-bold text-leaf-700">上位{result.topPercent}%</span>
          </p>
        )}
      </div>
      <div className="relative px-4 py-4">
        <p className="text-xs font-bold text-ink-700">あなたに向いている職種トップ3</p>
        <ul aria-hidden="true" className="mt-2 select-none space-y-2 blur-sm">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-center justify-between rounded border border-sand-200 px-3 py-2 text-sm">
              <span>
                {n}. ■■■■■■
              </span>
              <span className="tabular-nums">相性 ■■%・■■■〜■■■万円</span>
            </li>
          ))}
        </ul>
        <p className="absolute inset-x-4 bottom-1/2 translate-y-1/2 rounded bg-white/90 px-3 py-2 text-center text-xs font-bold text-ink-900 shadow-sm">
          🔒 連絡先を入力すると、向いている職種トップ3と年収アップの見込みがすぐに表示されます
        </p>
      </div>
    </div>
  );
}

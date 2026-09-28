"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { answeredCount, captureUtm, clearDraft, loadDraft, loadLastToken } from "@/lib/draft";

const KEYS = QUESTIONS.map((q) => q.key);

/** 求人メディア風の CTA (オレンジ・下に濃い影・きらめき) */
export const CTA_CLASS =
  "cta-shine group inline-flex w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-10 py-4 text-lg font-black tracking-wide text-white shadow-[0_5px_0_var(--color-orange-800)] transition-all hover:bg-orange-600 active:translate-y-[3px] active:shadow-[0_2px_0_var(--color-orange-800)] sm:w-auto";

function Arrow() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-orange-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** 開始ボタン。途中保存があれば「続きから」、前回の結果があれば結果へのリンクも出す。 */
export function TopActions({ align = "start", note = true, onDark = false }: { align?: "start" | "center"; note?: boolean; onDark?: boolean }) {
  const router = useRouter();
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  useEffect(() => {
    captureUtm(window.location.search);
    const d = loadDraft();
    const n = d ? answeredCount(d.answers, KEYS) : 0;
    // 外部ストレージ (localStorage) の値を読んで表示を切り替えるだけなので effect 内で set する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResumeAt(n > 0 ? n : null);
    setLastToken(loadLastToken());
  }, []);

  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-stretch sm:items-start"}`}>
      {resumeAt !== null ? (
        <>
          <Link href={`/diagnosis?q=${resumeAt + 1}`} className={CTA_CLASS}>
            続きから再開する (Q{Math.min(resumeAt + 1, QUESTIONS.length)}〜)
            <Arrow />
          </Link>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              router.push("/diagnosis");
            }}
            className={`text-sm font-bold underline underline-offset-4 ${onDark ? "text-white/90 hover:text-white" : "text-ink-700 hover:text-ink-900"}`}
          >
            最初からやり直す
          </button>
        </>
      ) : (
        <Link href="/diagnosis" className={CTA_CLASS}>
          無料で診断をはじめる
          <Arrow />
        </Link>
      )}
      {note && resumeAt === null && <p className={`text-xs font-bold ${onDark ? "text-white/85" : "text-ink-500"}`}>＼ 会員登録なし・全{QUESTIONS.length}問 ／</p>}
      {lastToken && (
        <Link href={`/result/${lastToken}`} className={`text-sm font-bold underline underline-offset-4 ${onDark ? "text-white/90 hover:text-white" : "text-ink-700 hover:text-ink-900"}`}>
          前回の診断結果を見る
        </Link>
      )}
    </div>
  );
}

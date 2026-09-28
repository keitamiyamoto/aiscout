"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { answeredCount, captureUtm, clearDraft, loadDraft, loadLastToken } from "@/lib/draft";

const KEYS = QUESTIONS.map((q) => q.key);

/** 押し込めるボタン (下に濃い影)。LP の CTA 用 */
export const CTA_CLASS =
  "group inline-flex w-full items-center justify-center gap-3 rounded-md sm:w-auto bg-sun-500 px-8 py-4 text-lg font-black tracking-wide text-ink-900 shadow-[0_5px_0_#b9831f] transition-all hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_#b9831f]";

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden="true">
      <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 開始ボタン。途中保存があれば「続きから」、前回の結果があれば結果へのリンクも出す。 */
export function TopActions({ align = "start", note = true }: { align?: "start" | "center"; note?: boolean }) {
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
            className="text-sm font-bold text-ink-700 underline underline-offset-4 hover:text-ink-900"
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
      {note && resumeAt === null && <p className="text-xs text-ink-500">会員登録なし・全{QUESTIONS.length}問・約3分</p>}
      {lastToken && (
        <Link href={`/result/${lastToken}`} className="text-sm font-bold text-ink-700 underline underline-offset-4 hover:text-ink-900">
          前回の診断結果を見る
        </Link>
      )}
    </div>
  );
}

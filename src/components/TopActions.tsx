"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { answeredCount, captureUtm, clearDraft, loadDraft, loadLastToken } from "@/lib/draft";

const KEYS = QUESTIONS.map((q) => q.key);

/** 黄色 + 青枠のピル型ボタン */
export const CTA_CLASS =
  "group relative inline-flex w-full items-center justify-center rounded-full border-2 border-leaf-600 bg-sun-500 px-12 py-4 text-lg font-black tracking-wider text-leaf-700 transition hover:brightness-95 active:translate-y-px sm:w-[22rem]";

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="absolute right-5 h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden="true">
      <path d="M7.5 4.5L13 10l-5.5 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
            前回の続きからスタート
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
          診断スタート
          <Arrow />
        </Link>
      )}
      {note && <p className={`text-[11px] leading-5 ${onDark ? "text-white/80" : "text-ink-500"}`}>診断結果をご覧いただくには、お名前と連絡先の入力が必要です。</p>}
      {lastToken && (
        <Link href={`/result/${lastToken}`} className={`text-sm font-bold underline underline-offset-4 ${onDark ? "text-white/90 hover:text-white" : "text-ink-700 hover:text-ink-900"}`}>
          前回の診断結果を見る
        </Link>
      )}
    </div>
  );
}

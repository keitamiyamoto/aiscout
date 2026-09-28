"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavButton } from "@/components/FormPending";
import { QUESTIONS } from "@/lib/questions";
import { answeredCount, captureUtm, clearDraft, loadDraft, loadLastToken } from "@/lib/draft";

const KEYS = QUESTIONS.map((q) => q.key);

/** 開始ボタン。途中保存があれば「続きから」、前回の結果があれば結果へのリンクも出す。 */
export function TopActions() {
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
    <div className="mt-8 flex flex-col items-start gap-3">
      {resumeAt !== null ? (
        <>
          <NavButton href={`/diagnosis?q=${resumeAt + 1}`} variant="accent" size="lg" busyLabel="診断を開いています…">
            続きから再開する (Q{Math.min(resumeAt + 1, QUESTIONS.length)}〜)
          </NavButton>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              router.push("/diagnosis");
            }}
            className="text-sm font-semibold text-leaf-700 hover:underline"
          >
            最初からやり直す
          </button>
        </>
      ) : (
        <NavButton href="/diagnosis" variant="accent" size="lg" busyLabel="診断を開いています…">
          無料で診断をはじめる →
        </NavButton>
      )}
      {lastToken && (
        <Link href={`/result/${lastToken}`} className="text-sm font-semibold text-ink-700 underline decoration-sand-300 underline-offset-4 hover:text-ink-900">
          前回の診断結果を見る
        </Link>
      )}
    </div>
  );
}

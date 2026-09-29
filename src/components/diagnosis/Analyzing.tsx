"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";

const PHASES = ["回答を集計しています", "同年代・同職種の年収相場と比べています", "あなたの強みを分析しています", "向いている職種を探しています"];

/** 診断中の演出。show の間、フェーズを順番にチェックしていく。 */
export function Analyzing({ show }: { show: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!show) return;
    const id = window.setInterval(() => setPhase((p) => Math.min(PHASES.length, p + 1)), 650);
    return () => {
      window.clearInterval(id);
      setPhase(0);
    };
  }, [show]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sand-50/90 px-4 backdrop-blur-sm" role="status" aria-live="polite" aria-busy="true">
      <div className="rise-in w-full max-w-sm rounded-lg border border-sand-200 bg-white p-7 text-center shadow-pop">
        <LogoMark size={72} className="mx-auto animate-bounce" />
        <p className="mt-4 font-display text-xl font-bold text-ink-900">診断しています…</p>
        <ul className="mt-5 space-y-2.5 text-left text-sm">
          {PHASES.map((label, i) => (
            <li key={label} className={`flex items-center gap-2.5 transition ${i <= phase ? "text-ink-900" : "text-ink-300"}`}>
              {i < phase ? (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf-600 text-[11px] text-white">✓</span>
              ) : i === phase ? (
                <span className="spinner !h-5 !w-5 !border-2" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-sand-200" />
              )}
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

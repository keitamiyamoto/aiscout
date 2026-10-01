"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Heading } from "@/components/ui";
import { MultiChoice, SingleChoice } from "@/components/diagnosis/Choices";
import { IncomeSlider, PrefecturePicker, SkillLevels } from "@/components/diagnosis/Inputs";
import { ContactForm } from "@/components/diagnosis/ContactForm";
import { Analyzing } from "@/components/diagnosis/Analyzing";
import { QUESTIONS, SECTIONS, type Question } from "@/lib/questions";
import { emptyContact, type AnswersDraft, type ContactDraft } from "@/lib/schemas";
import { answeredCount, captureUtm, clearDraft, loadDraft, loadUtm, saveDraft, saveLastToken } from "@/lib/draft";
import { submitDiagnosisAction } from "@/app/actions/diagnosis";
import { trackContactView, trackDiagnosisStart, trackDiagnosisStep, trackLead } from "@/lib/analytics";

const KEYS = QUESTIONS.map((q) => q.key);
const MIN_ANALYZING_MS = 2800;
const STEP_SECTIONS = [...Object.entries(SECTIONS), ["contact", "連絡先"]] as const;

function stepFromQuery(q: string | null): number {
  const n = Number(q);
  return Number.isInteger(n) && n >= 1 ? n - 1 : 0;
}

export default function DiagnosisFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const [initial] = useState(() => loadDraft());
  const [answers, setAnswers] = useState<AnswersDraft>(initial?.answers ?? {});
  const [contact, setContact] = useState<ContactDraft>({ ...emptyContact(), ...(initial?.contact ?? {}), consent: false });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const advancing = useRef(false);

  // URL の ?q= が現在の質問。未回答の質問より先には進めない (直リンク・リロード対策)
  const step = Math.min(stepFromQuery(params.get("q")), answeredCount(answers, KEYS));
  const [dir, setDir] = useState<"next" | "prev">("next");
  useEffect(() => {
    advancing.current = false;
    // 計測: どの質問まで進んだか (離脱の分析用)。個人情報は送らない
    if (step === QUESTIONS.length) trackContactView();
    else if (step > 0) trackDiagnosisStep(step, KEYS[step - 1]);
  }, [step]);
  useEffect(() => {
    // 広告から診断ページに直接来た場合も、流入元とクリックIDを残す
    captureUtm(window.location.search);
    if (answeredCount(initial?.answers ?? {}, KEYS) === 0) trackDiagnosisStart();
  }, [initial]);
  useEffect(() => {
    // ブラウザの「戻る」「進む」でもアニメーションの向きを合わせる
    const onPop = () => setDir("prev");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const { consent: _c, ...rest } = contact;
    void _c;
    saveDraft({ answers, contact: rest });
  }, [answers, contact]);

  const go = (n: number) => {
    setDir("next");
    window.history.pushState(null, "", `?q=${n + 1}`);
    window.scrollTo({ top: 0 });
  };
  const back = () => (step > 0 ? window.history.back() : router.push("/"));

  const answer = (patch: AnswersDraft, advance: boolean) => {
    const next = { ...answers, ...patch };
    setAnswers(next);
    if (!advance || advancing.current) return;
    advancing.current = true;
    window.setTimeout(() => go(Math.min(step + 1, answeredCount(next, KEYS))), 230);
  };

  const submit = async () => {
    setSubmitting(true);
    setMessage(null);
    setErrors({});
    const started = Date.now();
    try {
      const res = await submitDiagnosisAction(answers, contact, { ...loadUtm(), website: honeypot });
      const wait = MIN_ANALYZING_MS - (Date.now() - started);
      if (res.ok) {
        trackLead(res.leadId, { marketValue: res.marketValue, rank: res.rank, jobCategory: answers.jobCategory });
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        saveLastToken(res.token);
        clearDraft();
        router.push(`/result/${res.token}`);
        return;
      }
      setSubmitting(false);
      setErrors(res.fieldErrors ?? {});
      setMessage(res.error);
      if (res.answersInvalid) {
        const firstBad = KEYS.findIndex((k) => res.fieldErrors?.[k]);
        if (firstBad >= 0) {
          const { [KEYS[firstBad]]: _drop, ...rest } = answers as Record<string, unknown>;
          void _drop;
          setAnswers(rest as AnswersDraft);
          go(firstBad);
        }
      }
    } catch {
      setSubmitting(false);
      setMessage("通信に失敗しました。電波の良いところでもう一度お試しください。");
    }
  };

  const q: Question | undefined = QUESTIONS[step];
  const sectionKey = q ? q.section : "contact";
  const sectionIndex = STEP_SECTIONS.findIndex(([k]) => k === sectionKey);
  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-32 pt-5 sm:pt-8">
      <Analyzing show={submitting} />

      {/* 進捗 */}
      <div className="sticky top-16 z-10 -mx-4 bg-sand-50/90 px-4 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-leaf-700">
            STEP {sectionIndex + 1}/{STEP_SECTIONS.length}・{STEP_SECTIONS[sectionIndex][1]}
          </span>
          <span className="tabular-nums text-ink-500">{q ? `Q${step + 1} / ${QUESTIONS.length}` : "最後です"}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-leaf-600 transition-[width] duration-500" style={{ width: `${Math.max(4, progress)}%` }} />
        </div>
      </div>

      <div key={step} className={`${dir === "next" ? "slide-next" : "slide-prev"} mt-4`}>
        {q ? (
          <>
            <p className="font-display text-sm font-bold text-leaf-700">Q{step + 1}</p>
            <Heading className="mt-1 text-2xl leading-snug sm:text-3xl">{q.title}</Heading>
            {q.hint && <p className="mt-2 text-sm text-ink-500">{q.hint}</p>}
            <div className="mt-6">
              <QuestionBody q={q} answers={answers} onAnswer={answer} />
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-sm font-bold text-leaf-700">あと少しで結果が出ます</p>
            <Heading className="mt-1 text-2xl leading-snug sm:text-3xl">診断結果をお届けする連絡先を教えてください</Heading>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              結果はこのあとすぐ画面に表示されます。あなたに合う求人やキャリアのご相談のため、担当のキャリアアドバイザーからご連絡することがあります。
            </p>
            <div className="mt-6">
              <ContactForm value={contact} onChange={setContact} errors={errors} honeypot={honeypot} onHoneypot={setHoneypot} />
            </div>
            {message && <p className="mt-4 rounded-lg bg-coral-100/60 px-4 py-3 text-sm font-medium text-coral-700">{message}</p>}
          </>
        )}
      </div>

      {/* 下部ナビ */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <Button variant="ghost" onClick={back}>
            ← 戻る
          </Button>
          <NextButton q={q} answers={answers} onNext={(patch) => answer(patch, true)} onSubmit={submit} submitting={submitting} />
        </div>
      </div>
    </main>
  );
}

function QuestionBody({ q, answers, onAnswer }: { q: Question; answers: AnswersDraft; onAnswer: (patch: AnswersDraft, advance: boolean) => void }) {
  const a = answers as Record<string, unknown>;
  switch (q.kind) {
    case "single":
      return <SingleChoice options={q.options} value={a[q.key] as string | undefined} columns={q.columns} onPick={(v) => onAnswer({ [q.key]: v }, true)} />;
    case "multi":
      return <MultiChoice options={q.options} values={(a[q.key] as string[] | undefined) ?? []} noneValue={q.noneValue} max={q.max} onChange={(v) => onAnswer({ [q.key]: v }, false)} />;
    case "income":
      return <IncomeSlider min={q.min} max={q.max} step={q.step} value={(a[q.key] as number | undefined) ?? q.initial} onChange={(v) => onAnswer({ [q.key]: v }, false)} />;
    case "prefecture":
      return <PrefecturePicker value={a[q.key] as string | undefined} onPick={(v) => onAnswer({ [q.key]: v }, true)} />;
    case "levels":
      return <SkillLevels items={q.items} scale={q.scale} values={(a[q.key] as Record<string, number> | undefined) ?? {}} onChange={(v) => onAnswer({ [q.key]: v }, false)} />;
  }
}

/** 選んだ瞬間に進む質問 (single / prefecture) 以外は「次へ」で進む */
function NextButton({
  q,
  answers,
  onNext,
  onSubmit,
  submitting,
}: {
  q: Question | undefined;
  answers: AnswersDraft;
  onNext: (patch: AnswersDraft) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  if (!q) {
    return (
      <Button variant="accent" size="lg" onClick={onSubmit} disabled={submitting} className="flex-1 sm:flex-none">
        {submitting ? "診断中…" : "診断結果を見る →"}
      </Button>
    );
  }
  const a = answers as Record<string, unknown>;
  const v = a[q.key];
  if (q.kind === "single" || q.kind === "prefecture") {
    return v !== undefined ? (
      <Button onClick={() => onNext({})} className="flex-1 sm:flex-none">
        次へ →
      </Button>
    ) : (
      <span className="text-xs text-ink-500">選ぶと次に進みます</span>
    );
  }
  if (q.kind === "multi") {
    const n = ((v as string[] | undefined) ?? []).length;
    return (
      <Button onClick={() => onNext({})} disabled={n < (q.min ?? 1)} className="flex-1 sm:flex-none">
        {n < (q.min ?? 1) ? "1つ以上選んでください" : `次へ (${n}つ選択中) →`}
      </Button>
    );
  }
  if (q.kind === "income") {
    return (
      <Button onClick={() => onNext({ [q.key]: (v as number | undefined) ?? q.initial })} className="flex-1 sm:flex-none">
        次へ →
      </Button>
    );
  }
  return (
    <Button onClick={() => onNext({ [q.key]: (v as Record<string, number> | undefined) ?? {} })} className="flex-1 sm:flex-none">
      次へ →
    </Button>
  );
}

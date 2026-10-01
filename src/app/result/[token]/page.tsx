import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { ReactNode } from "react";
import { Mascot } from "@/components/brand/Mascot";
import { CountUp } from "@/components/result/CountUp";
import { IncomeBars, ScoreGauge, TraitRadar } from "@/components/result/Charts";
import { InterviewCta, LineLink } from "@/components/result/InterviewCta";
import { candidateDates } from "@/lib/interview-dates";
import { getLeadByToken } from "@/lib/leads";
import { ENGINE_VERSION, RANK_LABEL, diagnose, type DiagnosisResult } from "@/lib/engine";
import { answersSchema } from "@/lib/schemas";
import { decodePreviewToken, isPreviewMode, isPreviewToken } from "@/lib/preview";

type View = { token: string; leadId: string; name: string; phone: string; requested: boolean; result: DiagnosisResult };

async function loadView(token: string): Promise<View | null> {
  if (isPreviewToken(token)) {
    const p = decodePreviewToken(token);
    return p ? { token, leadId: "preview", name: p.name, phone: "", requested: false, result: diagnose(p.answers) } : null;
  }
  if (isPreviewMode()) return null;
  const lead = await getLeadByToken(token);
  if (!lead) return null;
  // 計算ロジックが変わる前の結果は、保存してある回答から計算し直して表示する
  let result = lead.result as DiagnosisResult;
  if (result.version !== ENGINE_VERSION) {
    const answers = answersSchema.safeParse(lead.answers);
    if (answers.success) result = diagnose(answers.data);
  }
  return { token: lead.token, leadId: lead.id, name: lead.name, phone: lead.phone, requested: Boolean(lead.interviewRequestedAt), result };
}

/** 青い帯の見出しがついた白い箱 (トップの「分かること」と同じ形) */
function Panel({ title, children, className = "" }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-md border-2 border-leaf-600 bg-white ${className}`}>
      <h2 className="bg-leaf-600 px-5 py-2.5 text-center font-black tracking-wider text-white">{title}</h2>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

const marker = "bg-[linear-gradient(transparent_65%,var(--color-sun-500)_65%)]";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "診断結果", robots: { index: false, follow: false } };

export default async function ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await loadView(token);
  if (!lead) notFound();
  const r = lead.result;
  const firstName = lead.name.split(/[\s　]/)[0] || lead.name || "あなた";
  const requested = lead.requested;

  return (
    <>
      <Header
        right={
          !requested && (
            <a href="#interview" className="hidden rounded-full border-2 border-leaf-600 bg-sun-500 px-4 py-1.5 text-sm font-black text-leaf-700 hover:brightness-95 sm:inline-block">
              無料で相談する
            </a>
          )
        }
      />
      <main className="flex-1 bg-white pb-28">
        {/* 市場価値 */}
        <section className="bg-leaf-50 px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <p className="flex items-center justify-center gap-2 font-black text-leaf-600">
              <span className="text-2xl font-light">＼</span>
              {firstName}さんの診断結果
              <span className="text-2xl font-light">／</span>
            </p>
            <div className="mt-4 rounded-xl border-[3px] border-leaf-100 bg-white px-5 py-7 sm:px-10">
              <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
                <div className="text-center sm:text-left">
                  <p className="font-black text-ink-700">あなたの市場価値は</p>
                  <p className="pop-in mt-1 font-black leading-none text-ink-900">
                    <span className={`${marker} px-1 text-6xl tabular-nums sm:text-7xl`}>
                      <CountUp value={r.marketValue} />
                    </span>
                    <span className="ml-1 text-2xl">万円</span>
                  </p>
                  <p className="mt-4 text-sm text-ink-700">
                    想定年収レンジ <span className="font-black text-ink-900">{r.low}〜{r.high}万円</span>
                  </p>
                  {r.currentIncome > 0 && (
                    <p className={`mt-3 inline-flex rounded-full px-4 py-1.5 text-sm font-black ${r.diff > 0 ? "bg-leaf-600 text-white" : "bg-sand-100 text-ink-700"}`}>
                      {r.diff > 0 ? `いまの年収より +${r.diff}万円` : r.diff === 0 ? "いまの年収と同水準" : "いまの年収は市場水準より高め"}
                    </p>
                  )}
                </div>
                <div className="flex items-end justify-center gap-2">
                  <ScoreGauge score={r.score} rank={r.rank} label={RANK_LABEL[r.rank]} topPercent={r.topPercent} />
                  <Mascot pose="wave" className="hidden w-24 sm:block" />
                </div>
              </div>
              <div className="mt-6 rounded-md bg-leaf-50 px-5 py-4 text-center sm:text-left">
                <p className="text-xs font-black text-leaf-700">あなたに向いている職種</p>
                <p className="mt-1 text-xl font-black text-ink-900 sm:text-2xl">{r.jobs.map((j) => j.name).join("・")}</p>
              </div>
              <p className="mt-5 text-sm leading-7 text-ink-700">{r.comment}</p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="年収の比較">
              <IncomeBars r={r} />
              <div className="mt-6 rounded-sm bg-sand-100 p-4 text-sm">
                <p className="text-ink-500">希望年収 {r.desiredIncome.toLocaleString("ja-JP")}万円は…</p>
                <p className="mt-1 text-base font-black text-ink-900">{r.desiredVerdict}</p>
              </div>
            </Panel>
            <Panel title="市場価値のポイント">
              {r.plus.length > 0 && (
                <ul className="space-y-3">
                  {r.plus.map((f) => (
                    <li key={f.label} className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-600 text-xs font-black text-white">↑</span>
                      <span>
                        <span className="block text-sm font-black text-ink-900">{f.label}</span>
                        <span className="block text-xs text-ink-500">{f.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {r.minus.length > 0 && (
                <>
                  <p className="mt-6 text-xs font-black text-leaf-700">ここを伸ばすとさらにアップ</p>
                  <ul className="mt-3 space-y-3">
                    {r.minus.map((f) => (
                      <li key={f.label} className="flex gap-3">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-leaf-600 text-xs font-black text-leaf-600">＋</span>
                        <span>
                          <span className="block text-sm font-black text-ink-900">{f.label}</span>
                          <span className="block text-xs text-ink-500">{f.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>
          </div>

          <Panel title="あなたのタイプ">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="text-2xl font-black text-ink-900">
                  <span className={`${marker} px-1`}>{r.persona.name}</span>
                </p>
                <p className="mt-3 text-sm leading-7 text-ink-700">{r.persona.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[...r.traits]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3)
                    .map((t) => (
                      <span key={t.key} className="rounded-sm bg-leaf-50 px-2.5 py-1 text-xs font-black text-leaf-700">
                        {t.label}
                      </span>
                    ))}
                </div>
              </div>
              <TraitRadar traits={r.traits} />
            </div>
          </Panel>

          <Panel title="あなたに向いている職種 TOP3">
            <ol className="divide-y divide-sand-200">
              {r.jobs.map((j, i) => (
                <li key={j.key} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-black ${i === 0 ? "bg-sun-500 text-ink-900" : "bg-leaf-50 text-leaf-700"}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-black text-ink-900">{j.name}</p>
                      <span className={`rounded-sm px-2 py-0.5 text-xs font-black ${j.experienced ? "bg-leaf-600 text-white" : "border border-leaf-600 text-leaf-700"}`}>{j.experienced ? "経験を活かせる" : "未経験から挑戦"}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs font-bold text-ink-500">相性</span>
                      <span className="h-2.5 flex-1 overflow-hidden bg-sand-100">
                        <span className="grow-x block h-full bg-leaf-600" style={{ width: `${j.match}%` }} />
                      </span>
                      <span className="text-lg font-black tabular-nums text-leaf-700">{j.match}%</span>
                    </div>
                    <p className="mt-2 text-sm text-ink-700">
                      想定年収 <span className="text-base font-black text-ink-900">{j.incomeLow}〜{j.incomeHigh}万円</span>
                    </p>
                    <p className="mt-2 text-sm leading-7 text-ink-500">{j.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          {/* カジュアル面談 */}
          <section id="interview" className="scroll-mt-20 pt-2">
            <InterviewCta token={lead.token} leadId={lead.leadId} name={firstName} phone={lead.phone} requested={requested} dates={candidateDates()} />
          </section>

          <p className="text-center text-xs leading-relaxed text-ink-500">
            ※ 診断結果は回答内容と一般的な求人相場をもとにした目安です。実際の年収や採用を保証するものではありません。
            <br />
            <Link href="/" className="font-bold text-leaf-700 hover:underline">
              トップへ戻る
            </Link>
          </p>
        </div>
      </main>

      {!requested && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-sand-200 bg-white/95 p-3 backdrop-blur sm:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <LineLink place="sticky_bar" className="flex w-[38%] items-center justify-center rounded-full bg-[#06C755] px-2 py-3 text-sm font-black leading-tight text-white">
            LINEで質問
          </LineLink>
          <a href="#interview" className="flex flex-1 items-center justify-center rounded-full border-2 border-leaf-600 bg-sun-500 px-3 py-3 text-sm font-black leading-tight text-leaf-700">
            無料でオンライン面談してみる
          </a>
        </div>
      )}
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge, Card, Heading } from "@/components/ui";
import { LogoMark } from "@/components/brand/Logo";
import { CountUp } from "@/components/result/CountUp";
import { IncomeBars, ScoreGauge, TraitRadar } from "@/components/result/Charts";
import { InterviewCta } from "@/components/result/InterviewCta";
import { getLeadByToken } from "@/lib/leads";
import { RANK_LABEL, diagnose, type DiagnosisResult } from "@/lib/engine";
import { decodePreviewToken, isPreviewMode, isPreviewToken } from "@/lib/preview";

type View = { token: string; name: string; phone: string; requested: boolean; result: DiagnosisResult };

async function loadView(token: string): Promise<View | null> {
  if (isPreviewToken(token)) {
    const p = decodePreviewToken(token);
    return p ? { token, name: p.name, phone: "", requested: false, result: diagnose(p.answers) } : null;
  }
  if (isPreviewMode()) return null;
  const lead = await getLeadByToken(token);
  if (!lead) return null;
  return { token: lead.token, name: lead.name, phone: lead.phone, requested: Boolean(lead.interviewRequestedAt), result: lead.result as DiagnosisResult };
}

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
            <a href="#interview" className="rounded-full bg-sun-500 px-4 py-2 text-sm font-bold text-ink-900 shadow-soft hover:brightness-95">
              無料で相談する
            </a>
          )
        }
      />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 pb-28 sm:py-10">
        {/* 市場価値 */}
        <section className="rise-in relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-8 text-white shadow-pop sm:px-10 sm:py-10">
          <LogoMark size={180} className="pointer-events-none absolute -right-8 -top-10 rotate-6 opacity-[0.1]" />
          <p className="text-sm font-medium text-sun-300">{firstName}さんの診断結果</p>
          <div className="mt-4 grid items-center gap-8 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-base font-semibold text-white/80">あなたの市場価値は</p>
              <p className="pop-in mt-1 font-display font-bold leading-none">
                <span className="text-6xl sm:text-7xl">
                  <CountUp value={r.marketValue} />
                </span>
                <span className="ml-1 text-2xl">万円</span>
              </p>
              <p className="mt-3 text-sm text-white/75">
                想定年収レンジ <span className="font-bold text-white">{r.low}〜{r.high}万円</span>
              </p>
              {r.currentIncome > 0 && (
                <p className={`mt-4 inline-flex rounded-full px-3.5 py-1.5 text-sm font-bold ${r.diff > 0 ? "bg-leaf-600 text-white" : "bg-white/10 text-white/85"}`}>
                  {r.diff > 0 ? `いまの年収より +${r.diff}万円` : r.diff === 0 ? "いまの年収と同水準" : "いまの年収は市場水準より高め"}
                </p>
              )}
            </div>
            <ScoreGauge score={r.score} rank={r.rank} label={RANK_LABEL[r.rank]} />
          </div>
          <div className="mt-8 rounded-2xl bg-white/[0.07] p-5">
            <p className="text-sm font-semibold text-white/60">向いている職種</p>
            <p className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{r.jobs.map((j) => j.name).join("・")}</p>
          </div>
        </section>

        <Card className="rise-in">
          <p className="text-sm leading-relaxed text-ink-700">{r.comment}</p>
        </Card>

        {/* 年収の内訳 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <Heading as="h2" className="text-lg">
              年収の比較
            </Heading>
            <div className="mt-5">
              <IncomeBars r={r} />
            </div>
            <div className="mt-6 rounded-2xl bg-sand-50 p-4 text-sm">
              <p className="text-ink-500">希望年収 {r.desiredIncome.toLocaleString("ja-JP")}万円は…</p>
              <p className="mt-1 font-display text-base font-bold text-ink-900">{r.desiredVerdict}</p>
            </div>
          </Card>
          <Card>
            <Heading as="h2" className="text-lg">
              市場価値のポイント
            </Heading>
            {r.plus.length > 0 && (
              <ul className="mt-4 space-y-3">
                {r.plus.map((f) => (
                  <li key={f.label} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-800">↑</span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{f.label}</span>
                      <span className="block text-xs text-ink-500">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {r.minus.length > 0 && (
              <>
                <p className="mt-6 text-xs font-bold tracking-wider text-ink-500">ここを伸ばすとさらにアップ</p>
                <ul className="mt-3 space-y-3">
                  {r.minus.map((f) => (
                    <li key={f.label} className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sun-100 text-xs font-bold text-ink-900">＋</span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">{f.label}</span>
                        <span className="block text-xs text-ink-500">{f.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        {/* タイプ */}
        <Card>
          <div className="grid items-center gap-6 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold text-leaf-700">あなたのタイプ</p>
              <Heading as="h2" className="mt-1 text-2xl">
                {r.persona.name}
              </Heading>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{r.persona.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...r.traits]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 3)
                  .map((t) => (
                    <Badge key={t.key} tone="green">
                      {t.label}
                    </Badge>
                  ))}
              </div>
            </div>
            <TraitRadar traits={r.traits} />
          </div>
        </Card>

        {/* 適職 */}
        <section>
          <Heading as="h2" className="text-xl">
            あなたに向いている職種 TOP3
          </Heading>
          <ol className="mt-4 space-y-4">
            {r.jobs.map((j, i) => (
              <li key={j.key} className="rise-in" style={{ animationDelay: `${i * 90}ms` }}>
                <Card className={`p-5 sm:p-6 ${i === 0 ? "border-2 border-sun-500" : ""}`}>
                  <div className="flex items-start gap-4">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-lg font-bold ${i === 0 ? "bg-sun-500 text-ink-900" : "bg-sand-100 text-ink-700"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl font-bold text-ink-900">{j.name}</p>
                        <Badge tone={j.experienced ? "indigo" : "sun"}>{j.experienced ? "経験を活かせる" : "未経験から挑戦"}</Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-ink-500">相性</span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand-100">
                          <span className="grow-x block h-full rounded-full bg-leaf-600" style={{ width: `${j.match}%` }} />
                        </span>
                        <span className="font-display text-lg font-bold tabular-nums text-leaf-700">{j.match}%</span>
                      </div>
                      <p className="mt-3 text-sm text-ink-700">
                        想定年収 <span className="font-display text-base font-bold text-ink-900">{j.incomeLow}〜{j.incomeHigh}万円</span>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-500">{j.reason}</p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* カジュアル面談 */}
        <section id="interview" className="scroll-mt-20 pt-2">
          <InterviewCta token={lead.token} name={firstName} phone={lead.phone} requested={requested} />
        </section>

        <p className="text-center text-xs leading-relaxed text-ink-500">
          ※ 診断結果は回答内容と一般的な求人相場をもとにした目安です。実際の年収や採用を保証するものではありません。
          <br />
          <Link href="/" className="font-semibold text-leaf-700 hover:underline">
            トップへ戻る
          </Link>
        </p>
      </main>

      {!requested && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sand-200 bg-white/95 p-3 backdrop-blur sm:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <a href="#interview" className="flex w-full items-center justify-center rounded-full bg-sun-500 px-6 py-3.5 font-bold text-ink-900 shadow-[0_6px_16px_-8px_rgb(242_179_61/0.8)]">
            まずはカジュアル面談してみる (無料)
          </a>
        </div>
      )}
      <Footer />
    </>
  );
}

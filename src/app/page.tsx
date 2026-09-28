import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TopActions } from "@/components/TopActions";
import { ResultPreview } from "@/components/brand/ResultPreview";
import { LogoMark } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";
import { QUESTIONS } from "@/lib/questions";

const POINTS = [
  { title: "約3分・タップで答えるだけ", body: `全${QUESTIONS.length}問。選ぶだけでどんどん進みます。途中で閉じても続きから再開できます。` },
  { title: "あなたの市場価値がわかる", body: "経験・スキル・勤務エリアから、転職市場での想定年収を算出します。" },
  { title: "向いている職種がわかる", body: "あなたの強みや志向から、相性の良い職種をTOP3でご提案します。" },
];

export default function TopPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-16">
          <section className="rise-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-800">無料・登録不要</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              あなたの市場価値、
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">いくら？</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-full bg-sun-300/80" aria-hidden="true" />
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500">{BRAND.description}</p>
            <TopActions />
            <ul className="mt-10 space-y-4">
              {POINTS.map((p, i) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-leaf-100 font-display text-sm font-bold text-leaf-800">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-ink-900">{p.title}</p>
                    <p className="text-sm text-ink-500">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="rise-in relative">
            <LogoMark size={88} className="absolute -top-12 right-2 hidden rotate-6 opacity-90 lg:block" />
            <ResultPreview />
            <p className="mt-4 text-center text-xs text-ink-500">※ 診断結果は目安です。結果をもとにキャリアアドバイザーへ無料で相談できます。</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

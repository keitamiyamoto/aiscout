import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/brand/Logo";
import { TopActions } from "@/components/TopActions";
import { ProductCollage } from "@/components/top/ProductCollage";
import { QUESTIONS } from "@/lib/questions";
import { CAREERS } from "@/lib/engine";
import { findImage } from "@/lib/images";
import { COMPANY } from "@/content/legal";
import { ADVISORS } from "@/content/advisors";

const RECOMMEND = [
  "今の年収が相場より低い気がする",
  "がんばっているのに給料が上がらない",
  "自分に向いている仕事がわからない",
  "未経験の職種に挑戦できるか知りたい",
  "転職するか迷っている・まだ決めていない",
  "自分の強みを客観的に知りたい",
];

const POINTS = [
  { label: "POINT 1", title: "あなたの市場価値がわかる", body: "職種・年齢・経験・勤務エリア・スキルから、転職した場合の想定年収を算出。いまの年収や同年代の平均とも比べられます。", icon: "yen" },
  { label: "POINT 2", title: "向いている職種TOP3がわかる", body: `強み・志向・経験を${Object.keys(CAREERS).length}の職種と照らし合わせ、相性の良い順に想定年収つきでご紹介します。`, icon: "job" },
  { label: "POINT 3", title: "プロに無料で相談できる", body: "結果をもとに、キャリアアドバイザーが具体的な求人や年収アップの進め方をご提案。相談は任意です。", icon: "talk" },
] as const;

const STEPS = [
  { title: "質問に答える", body: `全${QUESTIONS.length}問。ほとんどタップするだけ。`, time: "約3分" },
  { title: "結果をチェック", body: "想定年収と向いている職種がすぐに表示されます。", time: "すぐ" },
  { title: "無料で相談", body: "希望する方はキャリアアドバイザーに相談できます。", time: "任意" },
];

const FAQ = [
  { q: "本当に無料ですか？", a: "はい、診断もキャリア相談もすべて無料です。料金が発生することはありません。" },
  { q: "会員登録は必要ですか？", a: "会員登録やパスワードの設定は不要です。結果をお届けするため、最後にお名前と連絡先だけ入力していただきます。" },
  { q: "電話がかかってきますか？", a: "ご希望に合う求人やキャリアのご相談のため、担当者からご連絡することがあります。連絡のつきやすい時間帯を選べます。不要な場合はお伝えいただければ連絡を停止します。" },
  { q: "年収はどうやって計算していますか？", a: "職種・年齢・経験年数・マネジメント経験・業界・企業規模・勤務エリア・スキルなどを、一般的な求人の年収相場と照らし合わせて算出しています。あくまで目安で、実際の年収を保証するものではありません。" },
  { q: "転職するか決めていなくても使えますか？", a: "もちろん使えます。「まずは自分の相場を知りたい」という方にこそおすすめです。" },
];

function Icon({ name }: { name: "yen" | "job" | "talk" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden="true">
      {name === "yen" && (
        <>
          <circle cx="16" cy="16" r="12" {...common} />
          <path d="M11 9.5l5 7 5-7M16 16.5V23M11.5 17h9M11.5 20.5h9" {...common} />
        </>
      )}
      {name === "job" && (
        <>
          <rect x="4.5" y="10" width="23" height="15" rx="2.5" {...common} />
          <path d="M12 10V7.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 20 7.5V10M4.5 16.5h23" {...common} />
        </>
      )}
      {name === "talk" && (
        <>
          <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6h17A2.5 2.5 0 0 1 27 8.5v10a2.5 2.5 0 0 1-2.5 2.5H13l-6 5v-5h0.5A2.5 2.5 0 0 1 5 18.5z" {...common} />
          <path d="M11 13.5h.01M16 13.5h.01M21 13.5h.01" {...common} strokeWidth={3} />
        </>
      )}
    </svg>
  );
}

function SectionTitle({ en, children, light = false }: { en: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-xs font-black tracking-[0.25em] ${light ? "text-sun-300" : "text-orange-500"}`}>{en}</p>
      <h2 className={`mt-2 text-2xl font-black leading-snug sm:text-[2rem] ${light ? "text-white" : "text-ink-900"}`}>{children}</h2>
      <span className={`mx-auto mt-4 block h-1 w-12 rounded-full ${light ? "bg-sun-300" : "bg-orange-500"}`} />
    </div>
  );
}

export default function TopPage() {
  const hero = findImage("hero");
  const advisors = ADVISORS.map((a) => ({ ...a, src: findImage(a.photo) }));

  return (
    <>
      {/* 運営表記バー */}
      <div className="bg-ink-900 text-[11px] text-white/80">
        <div className="mx-auto max-w-6xl truncate px-4 py-1.5">
          運営：{COMPANY.name}（厚生労働大臣許可 有料職業紹介事業 {COMPANY.licenseNumber}）
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b-2 border-leaf-600 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" aria-label="トップへ">
            <Logo size="md" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-ink-700 md:flex">
            <a href="#points" className="hover:text-leaf-700">
              診断でわかること
            </a>
            <a href="#flow" className="hover:text-leaf-700">
              ご利用の流れ
            </a>
            <a href="#faq" className="hover:text-leaf-700">
              よくある質問
            </a>
            <Link href="/diagnosis" className="rounded-full bg-orange-500 px-5 py-2 font-black text-white shadow-[0_3px_0_var(--color-orange-800)] hover:bg-orange-600">
              無料で診断する
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-white">
        {/* ファーストビュー */}
        <section className="relative overflow-hidden bg-leaf-600">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-leaf-700" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-leaf-700/60" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-14">
            <div className="text-white">
              <p className="inline-block -skew-x-12 bg-sun-500 px-3 py-1 text-sm font-black text-ink-900">
                <span className="inline-block skew-x-12">＼ 3分でわかる ／</span>
              </p>
              <h1 className="mt-4 text-[2.4rem] font-black leading-[1.25] tracking-tight sm:text-[3.4rem]">
                あなたの年収、
                <br />
                <span className="text-sun-300">適正</span>ですか？
              </h1>
              <p className="mt-4 text-base font-bold leading-7 text-white/90 sm:text-lg">
                かんたんな質問に答えるだけで
                <br />
                <span className="border-b-2 border-sun-300">市場価値（想定年収）</span>と<span className="border-b-2 border-sun-300">向いている職種</span>がわかる！
              </p>

              <ul className="mt-6 flex gap-3">
                {[
                  ["完全", "無料"],
                  ["登録", "不要"],
                  ["全" + QUESTIONS.length, "問"],
                ].map(([a, b]) => (
                  <li key={a + b} className="grid h-[76px] w-[76px] place-items-center rounded-full border-[3px] border-sun-300 bg-white text-center leading-tight text-leaf-800 shadow-[0_4px_0_rgb(0_0_0/0.12)] sm:h-[88px] sm:w-[88px]">
                    <span>
                      <span className="block text-[11px] font-black sm:text-xs">{a}</span>
                      <span className="block text-xl font-black sm:text-2xl">{b}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <TopActions onDark />
              </div>
            </div>

            <div className="relative">
              {hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero} alt="" className="mx-auto aspect-[4/3] w-full max-w-[520px] rounded-2xl border-4 border-white object-cover shadow-[0_18px_40px_-18px_rgb(0_0_0/0.5)]" />
              ) : (
                <ProductCollage />
              )}
            </div>
          </div>
        </section>

        {/* こんな方におすすめ */}
        <section className="bg-sky-50 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4">
            <SectionTitle en="RECOMMEND">こんな方におすすめです</SectionTitle>
            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {RECOMMEND.map((r) => (
                <li key={r} className="flex items-center gap-3 rounded-md border border-sky-100 bg-white px-4 py-3.5 text-[15px] font-bold text-ink-900 shadow-[0_2px_0_var(--color-sky-100)]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-orange-500 text-sm font-black text-white" aria-hidden="true">
                    ✓
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            <div className="relative mx-auto mt-10 max-w-xl rounded-md bg-orange-500 px-6 py-4 text-center text-lg font-black text-white">
              ひとつでも当てはまったら、まずは診断！
              <span className="absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[12px] border-x-transparent border-t-orange-500" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* わかること */}
        <section id="points" className="scroll-mt-20 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle en="POINT">この診断でわかること</SectionTitle>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {POINTS.map((p) => (
                <li key={p.label} className="relative rounded-lg border-2 border-leaf-600 bg-white px-5 pb-6 pt-9">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-leaf-600 px-4 py-1 text-xs font-black tracking-wider text-white">{p.label}</span>
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-50 text-leaf-700">
                    <Icon name={p.icon} />
                  </span>
                  <h3 className="mt-4 text-center text-lg font-black text-ink-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-700">{p.body}</p>
                </li>
              ))}
            </ol>

            {/* 表示例 */}
            <div className="mt-12 overflow-hidden rounded-lg border border-sand-300">
              <p className="bg-ink-900 px-5 py-2.5 text-sm font-black text-white">診断結果の例｜30代前半・営業・東京都の方の場合</p>
              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-sand-200 p-5 md:border-b-0 md:border-r">
                  <p className="text-xs font-bold text-ink-500">あなたの市場価値</p>
                  <p className="mt-1 text-ink-900">
                    <span className="text-5xl font-black">550</span>
                    <span className="text-lg font-black">万円</span>
                    <span className="ml-3 inline-block rounded-sm bg-orange-50 px-2 py-0.5 align-middle text-sm font-black text-orange-600">いまより +100万円</span>
                  </p>
                  <p className="mt-2 text-sm text-ink-700">想定レンジ 500〜620万円 ／ 同年代・同職種の平均 520万円</p>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-ink-500">向いている職種 TOP3</p>
                  <ol className="mt-2 space-y-1.5 text-sm">
                    {[
                      ["法人営業", "96%", "530〜650万円"],
                      ["キャリアアドバイザー", "93%", "470〜580万円"],
                      ["不動産営業", "89%", "520〜630万円"],
                    ].map(([name, match, income], i) => (
                      <li key={name} className="flex items-baseline gap-3">
                        <span className={`grid h-5 w-5 place-items-center rounded-sm text-xs font-black ${i === 0 ? "bg-sun-500 text-ink-900" : "bg-sand-200 text-ink-700"}`}>{i + 1}</span>
                        <span className="flex-1 font-black text-ink-900">{name}</span>
                        <span className="text-xs font-bold text-leaf-700">相性{match}</span>
                        <span className="hidden text-xs text-ink-700 sm:inline">{income}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 中間 CTA */}
        <section className="bg-orange-50 py-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
            <p className="text-lg font-black text-ink-900 sm:text-xl">あなたの市場価値、いますぐチェック！</p>
            <TopActions align="center" />
          </div>
        </section>

        {/* アドバイザー (写真と情報を登録したときだけ表示) */}
        {advisors.length > 0 && (
          <section className="py-14 sm:py-20">
            <div className="mx-auto max-w-5xl px-4">
              <SectionTitle en="ADVISOR">あなたを担当するキャリアアドバイザー</SectionTitle>
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {advisors.map((a) => (
                  <li key={a.name} className="overflow-hidden rounded-lg border border-sand-300 bg-white">
                    {a.src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.src} alt={a.name} className="aspect-square w-full object-cover" />
                    )}
                    <div className="p-5">
                      <p className="text-xs font-bold text-leaf-700">{a.role}</p>
                      <p className="mt-1 text-lg font-black text-ink-900">{a.name}</p>
                      <p className="mt-2 text-sm leading-7 text-ink-700">「{a.comment}」</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 流れ */}
        <section id="flow" className="scroll-mt-20 bg-leaf-700 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle en="FLOW" light>
              ご利用の流れ
            </SectionTitle>
            <ol className="mt-10 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {STEPS.map((s, i) => (
                <li key={s.title} className="contents">
                  <div className="rounded-lg bg-white p-6 text-center">
                    <p className="text-xs font-black tracking-widest text-orange-500">STEP {i + 1}</p>
                    <p className="mt-2 text-lg font-black text-ink-900">{s.title}</p>
                    <p className="mt-2 text-sm leading-6 text-ink-700">{s.body}</p>
                    <p className="mt-3 inline-block rounded-full bg-leaf-50 px-3 py-0.5 text-xs font-black text-leaf-700">{s.time}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="grid place-items-center text-2xl text-sun-300 md:text-3xl" aria-hidden="true">
                      <span className="rotate-90 md:rotate-0">▶</span>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <SectionTitle en="FAQ">よくある質問</SectionTitle>
            <div className="mt-9 space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-md border border-sand-300 bg-white">
                  <summary className="flex list-none items-center gap-3 px-4 py-4 font-black text-ink-900 [&::-webkit-details-marker]:hidden">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-leaf-600 text-sm text-white">Q</span>
                    <span className="flex-1">{f.q}</span>
                    <span className="text-leaf-700 transition-transform group-open:rotate-180" aria-hidden="true">
                      ▼
                    </span>
                  </summary>
                  <div className="flex gap-3 border-t border-sand-200 px-4 py-4 text-sm leading-7 text-ink-700">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-orange-500 text-sm font-black text-white">A</span>
                    <p className="flex-1">{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 最後の CTA */}
        <section className="bg-leaf-600 py-12 sm:py-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center">
            <p className="text-2xl font-black leading-snug text-white sm:text-3xl">
              その年収、
              <span className="text-sun-300">上げられる</span>かも。
            </p>
            <TopActions align="center" onDark />
          </div>
        </section>

        <p className="mx-auto max-w-6xl px-4 py-6 text-xs leading-6 text-ink-500">※ 診断結果は回答内容と一般的な求人相場をもとにした目安です。実際の年収や採用を保証するものではありません。</p>
      </main>

      {/* スマホ下部の固定 CTA */}
      <div className="sticky bottom-0 z-30 border-t border-sand-200 bg-white/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <Link href="/diagnosis" className="cta-shine flex w-full items-center justify-center rounded-full bg-orange-500 py-3.5 font-black text-white shadow-[0_4px_0_var(--color-orange-800)]">
          無料で診断をはじめる（約3分）
        </Link>
      </div>
      <Footer />
    </>
  );
}

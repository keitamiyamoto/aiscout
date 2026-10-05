import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/brand/Logo";
import { GrowthIllustration, JobIllustration, Mascot } from "@/components/brand/Mascot";
import { TopActions } from "@/components/TopActions";
import { QUESTIONS } from "@/lib/questions";
import { CAREERS } from "@/lib/engine";
import { BRAND } from "@/lib/brand";

const FAQ = [
  { q: "転職は考えていないのですが、診断は受けられますか？", a: "はい、受けられます。「まずは自分の相場を知りたい」という方にこそおすすめです。" },
  { q: "本当に無料ですか？", a: "診断もキャリアアドバイザーへの相談も、すべて無料です。" },
  { q: "会員登録は必要ですか？", a: "会員登録やパスワードの設定は不要です。診断結果をご覧いただくため、最後にお名前と連絡先だけ入力していただきます。" },
  { q: "診断の途中で回答をやめた場合、途中から再開できますか？", a: "回答は自動で保存されるので、やめた質問から再開できます。トップページの「前回の続きからスタート」を押してください。" },
  { q: "年収はどうやって計算していますか？", a: "職種・年齢・経験年数・マネジメント経験・業界・企業規模・勤務エリア・スキルなどを、一般的な求人の年収相場と照らし合わせて算出しています。あくまで目安で、実際の年収を保証するものではありません。" },
];

/** ＼ ○○ ／ の見出し */
function Slash({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 font-black text-leaf-600">
      <span className="text-2xl font-light">＼</span>
      <span className="text-base sm:text-lg">{children}</span>
      <span className="text-2xl font-light">／</span>
    </p>
  );
}

/** 黄色マーカーを引いた大見出し */
function Title({ as: Tag = "h1" }: { as?: "h1" | "p" }) {
  return (
    <Tag className="mt-2 text-center text-[2rem] font-black leading-tight tracking-tight text-ink-900 sm:text-[2.6rem]">
      <span className="bg-[linear-gradient(transparent_68%,var(--color-sun-500)_68%)] px-1">自分の市場価値</span>
      <br />
      <span className="bg-[linear-gradient(transparent_68%,var(--color-sun-500)_68%)] px-1">調べるくん</span>
    </Tag>
  );
}

function Watermark() {
  return <span className="pointer-events-none absolute inset-0 grid place-items-center text-4xl font-black tracking-widest text-coral-600/40">SAMPLE</span>;
}

function FeatureCard({ no, small, big, body, point, sample }: { no: number; small: string; big: string; body: string; point: string; sample: ReactNode }) {
  return (
    // 左右のカードで「見出し・説明・見本・POINT」の行の高さを揃える (親グリッドの行を subgrid で共有)
    <article className="row-span-4 grid grid-rows-subgrid gap-y-0 overflow-hidden rounded-md border-2 border-leaf-600 bg-white">
      <h3 className="bg-leaf-600 py-3 text-center font-black text-white">
        <span className="text-lg">{no}. </span>
        <span className="text-sm">{small}</span>
        <span className="text-xl">{big}</span>
      </h3>
      <p className="px-5 pt-5 text-sm leading-7 text-ink-700 sm:px-7">{body}</p>
      <div className="px-5 pt-5 sm:px-7">
        <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-sm border-2 border-leaf-100 bg-white p-4">
          {sample}
          <Watermark />
        </div>
      </div>
      <div className="px-5 pb-6 pt-9 sm:px-7">
        <div className="h-full rounded-sm bg-sand-100 px-5 pb-5">
          <div className="-mt-5 flex items-end gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-600 text-[10px] font-black text-white">POINT</span>
            <p className="pb-0.5 font-black text-ink-900">診断結果の活かし方</p>
          </div>
          <p className="mt-3 text-sm leading-7 text-ink-700">{point}</p>
        </div>
      </div>
    </article>
  );
}

export default function TopPage() {
  return (
    <>
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="トップへ">
            <Logo size="md" />
          </Link>
          <p className="hidden text-xs text-ink-500 md:block">転職したらいくら？が分かる、社会人向け市場価値診断</p>
        </div>
      </header>

      <main className="flex-1 bg-white">
        {/* ファーストビュー */}
        <section className="relative overflow-hidden bg-leaf-50">
          <div className="mx-auto grid max-w-6xl items-center px-4 pb-12 pt-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:py-14">
            <div className="hidden justify-center lg:flex">
              <Mascot className="w-56 xl:w-64" />
            </div>

            <div className="mx-auto w-full max-w-[34rem]">
              <div className="mb-4 flex items-end justify-center gap-2 lg:hidden">
                <Mascot className="w-28" />
                <GrowthIllustration className="w-32" />
              </div>
              <div className="rounded-xl border-[3px] border-leaf-100 bg-white px-5 py-8 text-center shadow-[0_2px_0_var(--color-leaf-100)] sm:px-10">
                <Slash>
                  転職したら<span className="text-xl">いくら？</span>が分かる
                </Slash>
                <Title />
                <p className="mt-5 text-sm font-bold leading-7 text-ink-700">
                  あなたの想定年収（市場価値）と
                  <br />
                  向いている職種が分かる、社会人向け市場価値診断
                </p>
                <div className="relative mx-auto mt-6 max-w-sm rounded-md bg-leaf-50 px-4 py-3 text-sm font-bold text-leaf-700">
                  所要時間 約<span className="text-2xl font-black">3</span>分　{QUESTIONS.length}の質問に直感で答えよう
                  <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-leaf-50" aria-hidden="true" />
                </div>
                <div className="mt-6 flex justify-center">
                  <TopActions align="center" />
                </div>
              </div>
            </div>

            <div className="hidden flex-col items-center gap-2 lg:flex">
              <GrowthIllustration className="w-60" />
              <JobIllustration className="w-52" />
            </div>
          </div>
        </section>

        {/* 分かること */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-xl font-black tracking-widest text-leaf-600 sm:text-2xl">市場価値調べるくんで分かること</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <FeatureCard
                no={1}
                small="あなたの"
                big="市場価値"
                body="職種・年齢・経験・勤務エリア・スキルから、転職した場合の想定年収を算出。いまの年収や同年代の平均とも比べられます。"
                point="いまの年収が相場と比べて高いのか低いのかが分かります。転職するときの希望年収の目安や、年収交渉の材料として活用できます。"
                sample={
                  <div className="text-left">
                    <p className="text-xs font-bold text-ink-500">あなたの市場価値は</p>
                    <p className="text-ink-900">
                      <span className="text-4xl font-black">550</span>
                      <span className="font-black">万円</span>
                    </p>
                    <div className="mt-3 space-y-2 text-[11px] font-bold text-ink-700">
                      {[
                        ["いまの年収", "62%", "bg-sand-300"],
                        ["市場価値", "84%", "bg-leaf-600"],
                        ["同年代の平均", "74%", "bg-sun-500"],
                      ].map(([l, w, c]) => (
                        <div key={l} className="flex items-center gap-2">
                          <span className="w-20 shrink-0">{l}</span>
                          <span className="h-2.5 flex-1 bg-sand-100">
                            <span className={`block h-full ${c}`} style={{ width: w }} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              />
              <FeatureCard
                no={2}
                small="あなたに"
                big="向いている職種"
                body={`あなたの強み・志向・経験を${Object.keys(CAREERS).length}の職種と照らし合わせ、相性の良い職種TOP3を想定年収つきでご紹介します。`}
                point="自分の強みが活きる仕事と、その仕事での年収の目安が分かります。未経験の職種に挑戦するかどうかの判断材料として活用できます。"
                sample={
                  <ol className="space-y-2 text-left text-sm">
                    {[
                      ["法人営業", "96%"],
                      ["キャリアアドバイザー", "93%"],
                      ["不動産営業", "89%"],
                    ].map(([name, match], i) => (
                      <li key={name} className="flex items-center gap-2 border-b border-sand-200 pb-2 last:border-0 last:pb-0">
                        <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black ${i === 0 ? "bg-sun-500 text-ink-900" : "bg-leaf-50 text-leaf-700"}`}>{i + 1}</span>
                        <span className="flex-1 font-black text-ink-900">{name}</span>
                        <span className="text-xs font-bold text-leaf-700">相性 {match}</span>
                      </li>
                    ))}
                  </ol>
                }
              />
            </div>
          </div>
        </section>

        {/* 2つ目の CTA */}
        <section className="pb-16 text-center">
          <div className="mx-auto max-w-xl px-4">
            <Slash>
              転職したら<span className="text-xl">いくら？</span>が分かる
            </Slash>
            <Title as="p" />
            <div className="mt-7 flex justify-center">
              <TopActions align="center" />
            </div>
          </div>
        </section>

        {/* よくある質問 */}
        <section className="bg-leaf-50 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-xl font-black tracking-widest text-leaf-600 sm:text-2xl">よくある質問</h2>
            <dl className="mt-10 divide-y divide-sand-200 border-y border-sand-200 bg-white">
              {FAQ.map((f) => (
                <div key={f.q} className="space-y-4 px-4 py-6 sm:px-6">
                  <dt className="flex items-start gap-4 font-black text-ink-900">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf-600 text-sm text-white">Q.</span>
                    <span className="pt-1.5">{f.q}</span>
                  </dt>
                  <dd className="flex items-start gap-4 text-sm leading-7 text-ink-700">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-leaf-600 text-sm font-black text-leaf-600">A.</span>
                    <span className="pt-1">{f.a}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <p className="mx-auto max-w-4xl px-4 py-6 text-center text-xs leading-6 text-ink-500">
          ※ {BRAND.name}の診断結果は、回答内容と一般的な求人相場をもとにした目安です。実際の年収や採用を保証するものではありません。
        </p>
      </main>
      <Footer />
    </>
  );
}

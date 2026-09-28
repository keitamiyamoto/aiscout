import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/brand/Logo";
import { TopActions } from "@/components/TopActions";
import { PhoneMock } from "@/components/top/PhoneMock";
import { QUESTIONS } from "@/lib/questions";
import { CAREERS } from "@/lib/engine";
import { COMPANY } from "@/content/legal";

const WORRIES = ["いまの年収って、相場より低いのかな…", "経験が浅くても、年収は上げられる？", "自分に向いている仕事がわからない", "転職するか決めていないけど、相場は知りたい"];

const FAQ = [
  { q: "本当に無料ですか？", a: "はい、診断もキャリア相談もすべて無料です。料金が発生することはありません。" },
  { q: "会員登録は必要ですか？", a: "会員登録やパスワードの設定は不要です。結果をお届けするため、最後にお名前と連絡先だけ入力していただきます。" },
  { q: "電話がかかってきますか？", a: "ご希望に合う求人やキャリアのご相談のため、担当者からご連絡することがあります。連絡のつきやすい時間帯を選べます。不要な場合はお伝えいただければ連絡を停止します。" },
  { q: "年収はどうやって計算していますか？", a: "職種・年齢・経験年数・マネジメント経験・業界・企業規模・勤務エリア・スキルなどを、一般的な求人の年収相場と照らし合わせて算出しています。あくまで目安で、実際の年収を保証するものではありません。" },
  { q: "転職するか決めていなくても使えますか？", a: "もちろん使えます。「まずは自分の相場を知りたい」という方にこそおすすめです。" },
];

const STEPS = [
  { no: "01", title: "質問に答える", time: "約3分", body: `いまのお仕事・経験・志向について全${QUESTIONS.length}問。ほとんどがタップするだけです。` },
  { no: "02", title: "結果を見る", time: "すぐ", body: "想定年収と、向いている職種TOP3がその場で表示されます。" },
  { no: "03", title: "キャリアアドバイザーに相談", time: "任意", body: "結果をもとに、具体的な求人や年収アップの進め方を無料で相談できます。" },
];

export default function TopPage() {
  const careerCount = Object.keys(CAREERS).length;
  return (
    <>
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="トップへ">
            <Logo size="md" />
          </Link>
          <Link href="/diagnosis" className="hidden rounded-md bg-ink-900 px-4 py-2 text-sm font-bold text-white hover:bg-ink-700 sm:inline-block">
            無料で診断する
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-white">
        {/* ファーストビュー */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-leaf-700 lg:block" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 lg:grid-cols-[1.25fr_1fr] lg:gap-0 lg:pb-20 lg:pt-16">
            <div>
              <p className="flex items-center gap-3 text-sm font-bold text-leaf-700">
                <span className="h-px w-8 bg-leaf-700" />
                年収・適職診断
              </p>
              <h1 className="mt-5 text-[2.6rem] font-black leading-[1.18] tracking-tight text-ink-900 sm:text-6xl">
                その年収、
                <br />
                <span className="text-leaf-700">安すぎ</span>ませんか？
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-ink-700 sm:text-lg">
                いまのお仕事・経験・スキルに答えるだけで、
                <br className="hidden sm:inline" />
                転職市場での<strong className="font-black text-ink-900">あなたの想定年収</strong>と<strong className="font-black text-ink-900">向いている職種</strong>がわかります。
              </p>

              <dl className="mt-8 grid max-w-md grid-cols-3 divide-x divide-sand-300 border-y border-sand-300 py-4 text-center">
                <div>
                  <dt className="text-xs font-bold text-ink-500">所要時間</dt>
                  <dd className="mt-1 text-ink-900">
                    <span className="text-3xl font-black">3</span>
                    <span className="text-sm font-bold">分</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-ink-500">質問数</dt>
                  <dd className="mt-1 text-ink-900">
                    <span className="text-3xl font-black">{QUESTIONS.length}</span>
                    <span className="text-sm font-bold">問</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-ink-500">料金</dt>
                  <dd className="mt-1 text-ink-900">
                    <span className="text-3xl font-black">0</span>
                    <span className="text-sm font-bold">円</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-8">
                <TopActions />
              </div>
            </div>

            <div className="relative -mx-4 flex items-center justify-center bg-leaf-700 px-4 py-10 lg:mx-0 lg:bg-transparent lg:py-0">
              <p className="absolute left-6 top-6 hidden text-xs font-bold leading-6 tracking-[0.3em] text-white/70 [writing-mode:vertical-rl] lg:block">タップで答えるだけ</p>
              <div className="origin-center scale-90 sm:scale-100">
                <PhoneMock />
              </div>
            </div>
          </div>
        </section>

        {/* こんな方に */}
        <section className="border-t border-sand-200 bg-sand-50 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-black text-ink-900 sm:text-3xl">こんなこと、思っていませんか？</h2>
            <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {WORRIES.map((w) => (
                <li key={w} className={`relative rounded-lg border border-sand-300 bg-white px-5 py-4 text-[15px] font-bold text-ink-900`}>
                  「{w}」
                  <span className="absolute -bottom-[7px] left-8 h-3 w-3 rotate-45 border-b border-r border-sand-300 bg-white" aria-hidden="true" />
                </li>
              ))}
            </ul>
            <p className="mt-12 text-center text-lg font-bold leading-8 text-ink-900">
              まずは<span className="border-b-4 border-sun-500">自分の相場</span>を知ることから。
              <br className="sm:hidden" />
              転職するかどうかは、そのあとで大丈夫です。
            </p>
          </div>
        </section>

        {/* わかること */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm font-bold text-leaf-700">診断でわかること</p>
            <h2 className="mt-2 text-2xl font-black leading-snug text-ink-900 sm:text-3xl">答え終わると、この2つがすぐに出ます。</h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <article className="border-t-4 border-ink-900 pt-6">
                <p className="text-5xl font-black text-sand-300">01</p>
                <h3 className="mt-2 text-xl font-black text-ink-900">あなたの市場価値 (想定年収)</h3>
                <p className="mt-2 text-sm leading-7 text-ink-700">職種・年齢・経験・勤務エリア・スキルから、転職した場合の想定年収を算出。いまの年収や同年代の平均とも比べられます。</p>
                <div className="mt-5 rounded-lg bg-sand-50 p-5">
                  <p className="text-xs font-bold text-ink-500">表示例 ｜ 30代前半・営業・東京都の場合</p>
                  <p className="mt-2 text-ink-900">
                    あなたの市場価値は <span className="text-4xl font-black">550</span>
                    <span className="font-bold">万円</span>
                  </p>
                  <p className="mt-1 text-sm text-ink-700">想定レンジ 500〜620万円 ／ いまの年収より +100万円</p>
                </div>
              </article>

              <article className="border-t-4 border-ink-900 pt-6">
                <p className="text-5xl font-black text-sand-300">02</p>
                <h3 className="mt-2 text-xl font-black text-ink-900">向いている職種 TOP3</h3>
                <p className="mt-2 text-sm leading-7 text-ink-700">あなたの強み・志向・経験を{careerCount}の職種と照らし合わせ、相性の良い順に想定年収と理由つきでご紹介します。</p>
                <div className="mt-5 rounded-lg bg-sand-50 p-5">
                  <p className="text-xs font-bold text-ink-500">表示例</p>
                  <ol className="mt-2 space-y-2 text-sm">
                    {[
                      ["法人営業", "96%", "530〜650万円"],
                      ["キャリアアドバイザー", "93%", "470〜580万円"],
                      ["不動産営業", "89%", "520〜630万円"],
                    ].map(([name, match, income], i) => (
                      <li key={name} className="flex items-baseline gap-3 border-b border-sand-200 pb-2 last:border-0 last:pb-0">
                        <span className="w-5 font-black text-leaf-700">{i + 1}</span>
                        <span className="flex-1 font-bold text-ink-900">{name}</span>
                        <span className="text-xs text-ink-500">相性 {match}</span>
                        <span className="hidden text-xs font-bold text-ink-700 sm:inline">{income}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 流れ */}
        <section className="bg-ink-900 py-14 text-white sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm font-bold text-sun-300">診断の流れ</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">登録なしで、すぐにはじめられます。</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
              {STEPS.map((s, i) => (
                <li key={s.no} className={`md:px-8 ${i > 0 ? "md:border-l md:border-white/15" : "md:pl-0"}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-sun-500">{s.no}</span>
                    <span className="rounded-sm bg-white/10 px-2 py-0.5 text-xs font-bold text-white/80">{s.time}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black">{s.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-2xl font-black text-ink-900 sm:text-3xl">よくある質問</h2>
            <div className="mt-8 divide-y divide-sand-200 border-y border-sand-200">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex list-none items-start gap-3 font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                    <span className="font-black text-leaf-700">Q.</span>
                    <span className="flex-1">{f.q}</span>
                    <span className="mt-1 text-ink-500 transition-transform group-open:rotate-45" aria-hidden="true">
                      ＋
                    </span>
                  </summary>
                  <p className="mt-3 flex gap-3 pl-0 text-sm leading-7 text-ink-700">
                    <span className="font-black text-sun-500">A.</span>
                    <span className="flex-1">{f.a}</span>
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 最後の CTA */}
        <section className="bg-sun-100 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-2xl font-black leading-snug text-ink-900 sm:text-3xl">
              あなたの本当の相場、
              <br className="sm:hidden" />
              3分で確かめてみませんか？
            </p>
            <div className="mt-8">
              <TopActions align="center" />
            </div>
          </div>
        </section>

        <section className="border-t border-sand-200 bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 text-xs leading-6 text-ink-500">
            <p className="font-bold text-ink-700">運営会社</p>
            <p>
              {COMPANY.name}｜{COMPANY.address}
            </p>
            <p>有料職業紹介事業 許可番号 {COMPANY.licenseNumber}</p>
            <p className="mt-2">※ 診断結果は回答内容と一般的な求人相場をもとにした目安です。実際の年収や採用を保証するものではありません。</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

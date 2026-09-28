/** トップに置く「結果イメージ」カード (静的なサンプル) */
export function ResultPreview() {
  return (
    <div className="relative rounded-3xl border border-sand-200 bg-white p-6 shadow-pop sm:p-7" aria-label="診断結果のイメージ">
      <span className="absolute -top-3 left-6 rounded-full bg-sun-500 px-3 py-1 text-xs font-bold text-ink-900 shadow-soft">結果イメージ</span>
      <p className="text-sm font-semibold text-ink-500">あなたの市場価値</p>
      <p className="mt-1 font-display font-bold text-ink-900">
        <span className="text-5xl tabular-nums">5<span className="blur-[6px]">40</span></span>
        <span className="ml-1 text-xl">万円</span>
      </p>
      <div className="mt-4 space-y-2.5 text-xs">
        {[
          { label: "いまの年収", w: "62%", tone: "bg-ink-300" },
          { label: "市場価値", w: "82%", tone: "bg-leaf-600" },
          { label: "同年代の平均", w: "74%", tone: "bg-sun-300" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-ink-500">{b.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-sand-100">
              <span className={`block h-full rounded-full ${b.tone}`} style={{ width: b.w }} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-sand-200 pt-5">
        <p className="text-sm font-semibold text-ink-500">あなたに向いている職種</p>
        <ul className="mt-3 space-y-2">
          {["法人営業", "カスタマーサクセス", "キャリアアドバイザー"].map((j, i) => (
            <li key={j} className="flex items-center gap-3 rounded-2xl bg-sand-50 px-3 py-2.5">
              <span className={`grid h-7 w-7 place-items-center rounded-full font-display text-sm font-bold ${i === 0 ? "bg-sun-500 text-ink-900" : "bg-white text-ink-700"}`}>{i + 1}</span>
              <span className={`flex-1 font-semibold text-ink-900 ${i > 0 ? "blur-[5px]" : ""}`}>{j}</span>
              <span className="text-xs font-bold text-leaf-700">{[94, 90, 87][i]}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

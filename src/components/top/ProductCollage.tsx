import { PhoneMock } from "@/components/top/PhoneMock";

/** 写真が無いときのファーストビュー右側: 実際の結果画面と質問画面を重ねたイメージ */
export function ProductCollage() {
  return (
    <div className="relative mx-auto h-[330px] w-full max-w-[460px] sm:h-[420px]" aria-hidden="true">
      <div className="absolute right-0 top-2 w-[215px] rotate-[3deg] rounded-xl bg-white p-4 sm:top-4 sm:w-[270px] sm:p-5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]">
        <p className="inline-block rounded-sm bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">診断結果イメージ</p>
        <p className="mt-3 text-xs font-bold text-ink-500">あなたの市場価値は</p>
        <p className="text-ink-900">
          <span className="text-4xl font-black tracking-tight sm:text-5xl">550</span>
          <span className="text-lg font-black">万円</span>
        </p>
        <p className="mt-1 inline-block rounded-sm bg-orange-50 px-2 py-0.5 text-xs font-black text-orange-600">いまの年収より +100万円</p>
        <div className="mt-4 space-y-2 text-[10px] font-bold text-ink-700">
          {[
            ["いまの年収", "62%", "bg-ink-300"],
            ["市場価値", "84%", "bg-orange-500"],
            ["同年代の平均", "74%", "bg-leaf-600"],
          ].map(([l, w, c]) => (
            <div key={l} className="flex items-center gap-2">
              <span className="w-16 shrink-0">{l}</span>
              <span className="h-2 flex-1 rounded-sm bg-sand-100">
                <span className={`block h-full rounded-sm ${c}`} style={{ width: w }} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-sand-200 pt-3">
          <p className="text-[10px] font-bold text-ink-500">向いている職種</p>
          <ol className="mt-1 space-y-0.5 text-xs font-black text-ink-900 sm:text-sm">
            <li>1. 法人営業</li>
            <li>2. キャリアアドバイザー</li>
          </ol>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 origin-bottom-left scale-[0.6] -rotate-[4deg] sm:scale-[0.78]">
        <PhoneMock />
      </div>
    </div>
  );
}

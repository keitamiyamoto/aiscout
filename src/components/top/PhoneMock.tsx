/** 実際の質問画面を再現したスマホのモック (画像ではなく HTML) */
export function PhoneMock() {
  const options = ["営業", "販売・接客", "事務・アシスタント", "ITエンジニア"];
  return (
    <div className="relative mx-auto w-[260px] rounded-[2.2rem] border-[10px] border-ink-900 bg-ink-900 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]" aria-hidden="true">
      <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-ink-900" />
      <div className="overflow-hidden rounded-[1.6rem] bg-sand-50">
        <div className="flex items-center justify-between border-b border-sand-200 bg-white px-4 pb-2.5 pt-7">
          <span className="text-[10px] font-black tracking-wider text-ink-900">年収・適職診断</span>
          <span className="text-[9px] font-bold text-ink-500">Q2 / 22</span>
        </div>
        <div className="h-1 bg-sand-200">
          <div className="h-full w-[9%] bg-leaf-600" />
        </div>
        <div className="px-4 pb-6 pt-4">
          <p className="text-[10px] font-bold text-leaf-700">Q2</p>
          <p className="mt-0.5 text-[15px] font-black leading-snug text-ink-900">いまのお仕事の職種は？</p>
          <div className="mt-3 space-y-1.5">
            {options.map((o, i) => (
              <div key={o} className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-[11px] font-bold ${i === 0 ? "border-leaf-600 bg-leaf-50 text-ink-900" : "border-sand-200 bg-white text-ink-700"}`}>
                <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border-2 ${i === 0 ? "border-leaf-600 bg-leaf-600" : "border-sand-300"}`}>
                  {i === 0 && <span className="h-1 w-1 rounded-full bg-white" />}
                </span>
                {o}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[9px] text-ink-500">タップするだけで次の質問へ</p>
        </div>
      </div>
    </div>
  );
}

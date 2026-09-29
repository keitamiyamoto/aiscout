import type { DiagnosisResult } from "@/lib/engine";
import { TRAITS } from "@/lib/engine";

/** 半円ゲージ (0〜100) */
export function ScoreGauge({ score, rank, label, topPercent }: { score: number; rank: string; label: string; topPercent?: number }) {
  const r = 52;
  const len = Math.PI * r;
  return (
    <div className="mx-auto">
      <div className="relative mx-auto w-44">
        <svg viewBox="0 0 128 72" className="w-full" aria-hidden="true">
          <path d={`M12 64a${r} ${r} 0 0 1 104 0`} stroke="#E3E8EE" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path
            d={`M12 64a${r} ${r} 0 0 1 104 0`}
            stroke="#FFE500"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - score / 100)}
          />
        </svg>
        <p className="absolute inset-x-0 bottom-0 text-center text-3xl font-black leading-none text-ink-900">
          {score}
          <span className="text-sm text-ink-500">/100</span>
        </p>
      </div>
      <p className="mt-3 whitespace-nowrap text-center text-xs font-bold text-ink-700">
        市場価値スコア・ランク <span className="text-base font-black text-leaf-600">{rank}</span>
        <span className="ml-1">({label})</span>
      </p>
      {topPercent !== undefined && (
        <p className="mt-1 text-center text-xs text-ink-500">
          同年代・同職種・同エリアの中で <span className="font-black text-ink-900">上位{topPercent}%</span>
        </p>
      )}
    </div>
  );
}

/** いまの年収 / 市場価値 / 同年代平均 の横棒 */
export function IncomeBars({ r }: { r: DiagnosisResult }) {
  const rows = [
    { label: "いまの年収", value: r.currentIncome, tone: "bg-ink-300" },
    { label: "あなたの市場価値", value: r.marketValue, tone: "bg-leaf-600" },
    { label: "同年代・同職種の平均", value: r.peerAverage, tone: "bg-sun-500" },
  ];
  const max = Math.max(...rows.map((x) => x.value), 1) * 1.1;
  return (
    <div className="space-y-3.5">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink-700">{row.label}</span>
            <span className="font-display font-bold tabular-nums text-ink-900">{row.value.toLocaleString("ja-JP")}万円</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-sand-100">
            <div className={`grow-x h-full rounded-full ${row.tone}`} style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 6つの強みのレーダーチャート */
export function TraitRadar({ traits }: { traits: DiagnosisResult["traits"] }) {
  const cx = 110;
  const cy = 104;
  const R = 72;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / traits.length - Math.PI / 2;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const;
  };
  const ring = (v: number) => traits.map((_, i) => pt(i, v).join(",")).join(" ");
  const shape = traits.map((t, i) => pt(i, Math.max(0.08, t.value / 100)).join(",")).join(" ");
  return (
    <svg viewBox="0 0 220 208" className="mx-auto w-full max-w-xs" role="img" aria-label={traits.map((t) => `${t.label} ${t.value}`).join("、")}>
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="#E3E8EE" strokeWidth="1" />
      ))}
      {traits.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E3E8EE" strokeWidth="1" />;
      })}
      <polygon points={shape} fill="rgb(10 136 212 / 0.2)" stroke="#0A88D4" strokeWidth="2" strokeLinejoin="round" />
      {traits.map((t, i) => {
        const [x, y] = pt(i, Math.max(0.08, t.value / 100));
        return <circle key={t.key} cx={x} cy={y} r="3" fill="#0A88D4" />;
      })}
      {traits.map((t, i) => {
        const [x, y] = pt(i, 1.24);
        return (
          <text key={t.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fontWeight="700" fill="#3C4652">
            {TRAITS[t.key].short}
          </text>
        );
      })}
    </svg>
  );
}

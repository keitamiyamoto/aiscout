/**
 * マスコット「調べるくん」と、トップの線画イラスト。
 * 色は 紺の線 + 水色の塗り + 黄色のアクセント (doda 風の線画トーン) に統一。
 */
const LINE = "#1D4F7C";
const FILL = "#CFE8FA";
const YELLOW = "#FFE500";

/** スカウター (片目のレンズ) をつけた丸いキャラクター */
export function Mascot({ className, pose = "point" }: { className?: string; pose?: "point" | "wave" }) {
  return (
    <svg viewBox="0 0 200 230" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 影 */}
      <ellipse cx="100" cy="218" rx="52" ry="7" fill="#1D4F7C" opacity="0.12" />
      {/* 足 */}
      <path d="M76 196c-2 10 0 16 10 16h8c4 0 5-4 3-8l-4-10" fill="#fff" stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M124 196c2 10 0 16-10 16h-8c-4 0-5-4-3-8l4-10" fill="#fff" stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      {/* 腕 */}
      {pose === "point" ? (
        <>
          <path d="M44 128c-14-8-22-24-20-40" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="24" cy="84" r="7" fill="#fff" stroke={LINE} strokeWidth="3" />
          <path d="M24 77V66" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M44 128c-16-2-26-14-28-30" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="16" cy="92" r="7.5" fill="#fff" stroke={LINE} strokeWidth="3" />
        </>
      )}
      <path d="M156 132c10 6 16 16 16 28" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="172" cy="164" r="7" fill="#fff" stroke={LINE} strokeWidth="3" />
      {/* からだ */}
      <path d="M100 42c40 0 64 34 64 80s-26 80-64 80-64-34-64-80 24-80 64-80z" fill={FILL} stroke={LINE} strokeWidth="3.4" />
      {/* おなかのハイライト */}
      <path d="M64 150c6 22 22 36 36 38" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      {/* ネクタイ */}
      <path d="M100 150l-6 8 6 22 6-22z" fill={YELLOW} stroke={LINE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M94 146h12l-3 6h-6z" fill={YELLOW} stroke={LINE} strokeWidth="2.6" strokeLinejoin="round" />
      {/* 左目 */}
      <ellipse cx="80" cy="106" rx="4.6" ry="6" fill={LINE} />
      <circle cx="81.5" cy="103.5" r="1.6" fill="#fff" />
      {/* スカウター: 耳のユニット + アーム + レンズ */}
      <path d="M150 88v-22" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="150" cy="62" r="4" fill={YELLOW} stroke={LINE} strokeWidth="2.6" />
      <rect x="143" y="86" width="20" height="34" rx="6" fill="#fff" stroke={LINE} strokeWidth="3" />
      <path d="M147 96h12M147 104h8" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M143 100h-8" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <rect x="103" y="88" width="36" height="30" rx="9" fill={YELLOW} fillOpacity="0.55" stroke={LINE} strokeWidth="3" />
      <ellipse cx="119" cy="104" rx="4.6" ry="6" fill={LINE} />
      <circle cx="120.5" cy="101.5" r="1.6" fill="#fff" />
      <path d="M108 95h8M130 112h4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      {/* 口とほっぺ */}
      <path d="M88 126c6 8 18 8 24 0" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="68" cy="122" rx="7" ry="4.5" fill="#FFB3B3" opacity="0.7" />
      <ellipse cx="134" cy="126" rx="7" ry="4.5" fill="#FFB3B3" opacity="0.7" />
      {/* きらめき */}
      <path d="M40 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={YELLOW} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M178 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={YELLOW} stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/** 上がっていく棒グラフ + 矢印 + コイン */
export function GrowthIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 178h200" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      {[
        [36, 136],
        [74, 112],
        [112, 86],
        [150, 58],
      ].map(([x, y], i) => (
        <rect key={x} x={x} y={y} width="28" height={178 - y} rx="3" fill={i === 3 ? YELLOW : FILL} stroke={LINE} strokeWidth="3" />
      ))}
      <path d="M34 118c30-8 62-26 88-46s46-38 62-52" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" strokeDasharray="2 8" />
      <path d="M170 16l20-2-4 20" stroke={LINE} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* コイン */}
      <g>
        <ellipse cx="206" cy="166" rx="22" ry="8" fill={YELLOW} stroke={LINE} strokeWidth="3" />
        <path d="M184 166v-10c0 4 10 8 22 8s22-4 22-8v10" fill={YELLOW} stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="206" cy="146" rx="22" ry="8" fill={YELLOW} stroke={LINE} strokeWidth="3" />
        <path d="M184 146v10M228 146v10" stroke={LINE} strokeWidth="3" />
        <text x="206" y="150.5" textAnchor="middle" fontSize="12" fontWeight="900" fill={LINE}>
          ¥
        </text>
      </g>
      <path d="M22 44l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={YELLOW} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** 職種カード (名刺) と虫めがね */
export function JobIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="24" y="70" width="120" height="78" rx="8" fill="#fff" stroke={LINE} strokeWidth="3" transform="rotate(-8 84 109)" />
      <rect x="54" y="44" width="120" height="78" rx="8" fill="#fff" stroke={LINE} strokeWidth="3" transform="rotate(4 114 83)" />
      <g transform="rotate(4 114 83)">
        <circle cx="80" cy="72" r="12" fill={FILL} stroke={LINE} strokeWidth="2.6" />
        <path d="M100 66h54M100 78h40M68 98h86M68 108h60" stroke={LINE} strokeWidth="2.6" strokeLinecap="round" />
        <rect x="138" y="52" width="26" height="10" rx="5" fill={YELLOW} stroke={LINE} strokeWidth="2.2" />
      </g>
      <circle cx="170" cy="130" r="30" fill="#fff" fillOpacity="0.6" stroke={LINE} strokeWidth="3.4" />
      <path d="M156 118c4-6 12-9 18-8" stroke={LINE} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M192 152l26 26" stroke={LINE} strokeWidth="9" strokeLinecap="round" />
      <path d="M192 152l26 26" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" />
      <path d="M206 34l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={YELLOW} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

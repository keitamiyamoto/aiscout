/** カジュアル面談の候補日 (日本時間)。ブラウザとサーバーの両方で使う。 */

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const JST_OFFSET = 9 * 3600 * 1000;
/** 明日から何日先まで選べるか */
export const SELECTABLE_DAYS = 14;
export const MAX_INTERVIEW_DATES = 3;

function jstParts(d: Date) {
  const j = new Date(d.getTime() + JST_OFFSET);
  return { y: j.getUTCFullYear(), m: j.getUTCMonth() + 1, d: j.getUTCDate(), w: j.getUTCDay() };
}
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export type CandidateDate = { value: string; month: number; day: number; weekday: string; weekend: boolean };

/** 明日から SELECTABLE_DAYS 日分の候補日 */
export function candidateDates(now: Date = new Date()): CandidateDate[] {
  const out: CandidateDate[] = [];
  for (let i = 1; i <= SELECTABLE_DAYS; i++) {
    const p = jstParts(new Date(now.getTime() + i * 86400_000));
    out.push({ value: iso(p.y, p.m, p.d), month: p.m, day: p.d, weekday: WEEKDAYS[p.w], weekend: p.w === 0 || p.w === 6 });
  }
  return out;
}

/** 選べる範囲の日付か (サーバーでの検証用。日付の変わり目をまたいでも弾かないよう前後1日の余裕を持たせる) */
export function isSelectableDate(value: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const p = jstParts(now);
  const today = Date.UTC(p.y, p.m - 1, p.d);
  const [y, m, d] = value.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const diff = Math.round((t - today) / 86400_000);
  return diff >= 0 && diff <= SELECTABLE_DAYS + 1;
}

/** "2026-10-01" -> "10月1日(木)" */
export function formatInterviewDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}月${d}日(${WEEKDAYS[w]})`;
}

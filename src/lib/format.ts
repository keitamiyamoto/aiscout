function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** 日本時間の "2026/09/28 21:05" */
export function formatJst(d: Date): string {
  const j = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${j.getUTCFullYear()}/${pad(j.getUTCMonth() + 1)}/${pad(j.getUTCDate())} ${pad(j.getUTCHours())}:${pad(j.getUTCMinutes())}`;
}

/** 1234 -> "1,234" */
export function yen(n: number): string {
  return n.toLocaleString("ja-JP");
}

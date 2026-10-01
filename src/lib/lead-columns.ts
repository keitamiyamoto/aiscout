/**
 * スプレッドシート転記と CSV ダウンロードで共通の列定義。
 * 列を増やすときはここに追加するだけで両方に反映されます (シートの1行目の見出しも合わせて更新してください)。
 */
import type { DiagnosisResult } from "@/lib/engine";
import { optionLabel } from "@/lib/questions";
import type { Answers } from "@/lib/schemas";
import { formatJst } from "@/lib/format";
import { formatInterviewDate } from "@/lib/interview-dates";

export type LeadLike = {
  id: string;
  token: string;
  name: string;
  nameKana: string;
  phone: string;
  email: string;
  contactTimes: string[];
  answers: unknown;
  result: unknown;
  status: string;
  memo: string;
  interviewRequestedAt: Date | null;
  interviewDates: string[];
  interviewTime: string | null;
  interviewNote: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  createdAt: Date;
};

export const LEAD_STATUS = [
  { value: "new", label: "未対応" },
  { value: "called", label: "架電済み" },
  { value: "scheduled", label: "面談設定" },
  { value: "done", label: "面談済み" },
  { value: "ng", label: "対象外" },
] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number]["value"];
export const statusLabel = (v: string) => LEAD_STATUS.find((s) => s.value === v)?.label ?? v;

type Col = { header: string; value: (l: LeadLike, a: Answers, r: DiagnosisResult, ctx: { kind: string; appUrl: string }) => string | number };

const join = (v: string[]) => v.join("・");

export const LEAD_COLUMNS: Col[] = [
  { header: "送信日時", value: (l) => formatJst(l.createdAt) },
  { header: "区分", value: (_l, _a, _r, c) => c.kind },
  { header: "氏名", value: (l) => l.name },
  { header: "ふりがな", value: (l) => l.nameKana },
  { header: "電話番号", value: (l) => l.phone },
  { header: "メールアドレス", value: (l) => l.email },
  { header: "連絡のつきやすい時間帯", value: (l) => join(l.contactTimes.map((t) => optionLabel("contactTimes", t))) },
  { header: "年齢", value: (_l, a) => optionLabel("age", a.age) },
  { header: "都道府県", value: (_l, a) => a.prefecture },
  { header: "職種", value: (_l, a) => optionLabel("jobCategory", a.jobCategory) },
  { header: "業界", value: (_l, a) => optionLabel("industry", a.industry) },
  { header: "雇用形態", value: (_l, a) => optionLabel("employmentType", a.employmentType) },
  { header: "従業員数", value: (_l, a) => optionLabel("companySize", a.companySize) },
  { header: "経験年数", value: (_l, a) => optionLabel("jobYears", a.jobYears) },
  { header: "マネジメント", value: (_l, a) => optionLabel("management", a.management) },
  { header: "転職回数", value: (_l, a) => optionLabel("jobChanges", a.jobChanges) },
  { header: "最終学歴", value: (_l, a) => optionLabel("education", a.education) },
  { header: "資格", value: (_l, a) => join(a.skills.map((s) => optionLabel("skills", s))) },
  { header: "スキル自己評価", value: (_l, a) => Object.entries(a.skillLevels).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => `${optionLabel("skillLevels", k)}${v}`).join(" ") },
  { header: "現在年収(万円)", value: (_l, a) => a.currentIncome },
  { header: "希望年収(万円)", value: (_l, a) => a.desiredIncome },
  { header: "転職希望時期", value: (_l, a) => optionLabel("timing", a.timing) },
  { header: "重視すること", value: (_l, a) => optionLabel("priority", a.priority) },
  { header: "市場価値(万円)", value: (_l, _a, r) => r.marketValue },
  { header: "想定レンジ", value: (_l, _a, r) => `${r.low}〜${r.high}` },
  { header: "スコア", value: (_l, _a, r) => `${r.score} (${r.rank})` },
  { header: "タイプ", value: (_l, _a, r) => r.persona.name },
  { header: "適職1", value: (_l, _a, r) => r.jobs[0]?.name ?? "" },
  { header: "適職2", value: (_l, _a, r) => r.jobs[1]?.name ?? "" },
  { header: "適職3", value: (_l, _a, r) => r.jobs[2]?.name ?? "" },
  { header: "面談申込日時", value: (l) => (l.interviewRequestedAt ? formatJst(l.interviewRequestedAt) : "") },
  { header: "面談希望日 (オンライン)", value: (l) => l.interviewDates.map(formatInterviewDate).join("・") },
  { header: "面談希望時間帯", value: (l) => (l.interviewTime ? optionLabel("interviewTime", l.interviewTime) : "") },
  { header: "相談したいこと", value: (l) => l.interviewNote ?? "" },
  { header: "対応状況", value: (l) => statusLabel(l.status) },
  { header: "メモ", value: (l) => l.memo },
  { header: "流入元", value: (l) => [l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(" / ") },
  { header: "gclid", value: (l) => l.gclid ?? "" },
  { header: "fbclid", value: (l) => l.fbclid ?? "" },
  { header: "結果URL", value: (l, _a, _r, c) => `${c.appUrl}/result/${l.token}` },
  { header: "ID", value: (l) => l.id },
];

export const LEAD_HEADERS = LEAD_COLUMNS.map((c) => c.header);

export function leadRow(l: LeadLike, kind: string, appUrl = process.env.APP_URL ?? ""): (string | number)[] {
  const a = l.answers as Answers;
  const r = l.result as DiagnosisResult;
  return LEAD_COLUMNS.map((c) => c.value(l, a, r, { kind, appUrl }));
}

/**
 * Chatwork に送る通知文。kind は「診断完了」か「面談申込」。
 * 行の値 (leadRow) から作るので、シートに書いた内容と通知の内容が必ず一致する。
 */
export function leadMessage(row: (string | number)[], kind: string): string {
  const r: Record<string, string> = {};
  LEAD_HEADERS.forEach((h, i) => (r[h] = String(row[i] ?? "")));
  const v = (key: string) => r[key] || "—";
  const isInterview = kind === "面談申込";
  const title = isInterview ? `【面談申込】${v("氏名")} さん（オンライン面談）` : `【新規診断】${v("氏名")} さん`;
  const lines = [
    `電話：${v("電話番号")}（つながりやすい時間：${v("連絡のつきやすい時間帯")}）`,
    `メール：${v("メールアドレス")}`,
    `年齢・エリア：${v("年齢")}／${v("都道府県")}`,
    `職種・雇用形態：${v("職種")}／${v("雇用形態")}（${v("業界")}）`,
    `年収：現在 ${v("現在年収(万円)")}万 → 市場価値 ${v("市場価値(万円)")}万（希望 ${v("希望年収(万円)")}万）`,
    `ランク：${v("スコア")}　適職：${v("適職1")}`,
    `転職希望時期：${v("転職希望時期")}`,
  ];
  if (isInterview) {
    lines.push(`面談希望日：${v("面談希望日 (オンライン)")}（${v("面談希望時間帯")}）`);
    if (r["相談したいこと"]) lines.push(`相談したいこと：${r["相談したいこと"]}`);
  }
  if (r["流入元"]) lines.push(`流入元：${r["流入元"]}`);
  lines.push(`結果：${v("結果URL")}`);
  return `[info][title]${title}[/title]${lines.join("\n")}[/info]`;
}

/** RFC 4180 形式の CSV (Excel で文字化けしないよう BOM 付き) */
export function toCsv(rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n";
}

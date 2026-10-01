/**
 * 計測イベント (GA4 / Google 広告 / Meta ピクセル)。
 * タグの ID は環境変数 (NEXT_PUBLIC_*) で渡し、未設定のタグには何も送らない。
 * 個人情報 (氏名・電話・メール) はどのタグにも送らない。
 */

export const ANALYTICS = {
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
  adsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "",
  adsLeadLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL ?? "",
  adsInterviewLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_INTERVIEW_LABEL ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
};

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
  }
}

/**
 * タグの読み込み (afterInteractive) より先にイベントが起きることがあるので、
 * タグが使えるようになるまで最大10秒待ってから送る。
 */
const pending: Array<{ kind: "gtag" | "fbq"; args: unknown[] }> = [];
let flushing = false;

function enabled(kind: "gtag" | "fbq") {
  return kind === "gtag" ? Boolean(ANALYTICS.gaId || ANALYTICS.adsId) : Boolean(ANALYTICS.metaPixelId);
}

function flush(deadline: number) {
  for (let i = 0; i < pending.length; ) {
    const fn = pending[i].kind === "gtag" ? window.gtag : window.fbq;
    if (typeof fn === "function") {
      fn(...pending[i].args);
      pending.splice(i, 1);
    } else i++;
  }
  if (pending.length && Date.now() < deadline) window.setTimeout(() => flush(deadline), 200);
  else {
    pending.length = 0;
    flushing = false;
  }
}

function send(kind: "gtag" | "fbq", args: unknown[]) {
  if (typeof window === "undefined" || !enabled(kind)) return;
  pending.push({ kind, args });
  if (!flushing) {
    flushing = true;
    flush(Date.now() + 10_000);
  }
}
const gtag = (...args: unknown[]) => send("gtag", args);
const fbq = (...args: unknown[]) => send("fbq", args);

/** 診断を始めた (Q1 を表示) */
export function trackDiagnosisStart() {
  gtag("event", "diagnosis_start");
  fbq("trackCustom", "DiagnosisStart");
}

/** 質問に答えて次へ進んだ (どこで離脱しているかを見るため) */
export function trackDiagnosisStep(step: number, key: string) {
  gtag("event", "diagnosis_step", { step, question: key });
}

/** 連絡先入力の画面まで来た */
export function trackContactView() {
  gtag("event", "diagnosis_contact_view");
  fbq("trackCustom", "ContactView");
}

/**
 * 診断完了 = リード獲得。広告の成果 (コンバージョン)。
 * leadId を transaction_id / eventID にして、同じ人の二重計上を防ぐ。
 */
export function trackLead(leadId: string, info: { marketValue: number; rank: string; jobCategory?: string }) {
  gtag("event", "generate_lead", { market_value: info.marketValue, rank: info.rank, job_category: info.jobCategory });
  if (ANALYTICS.adsId && ANALYTICS.adsLeadLabel) {
    gtag("event", "conversion", { send_to: `${ANALYTICS.adsId}/${ANALYTICS.adsLeadLabel}`, transaction_id: leadId });
  }
  fbq("track", "Lead", {}, { eventID: `lead-${leadId}` });
}

/** カジュアル面談の申込。広告の成果 (コンバージョン) */
export function trackInterviewRequest(leadId: string, dates: number) {
  gtag("event", "interview_request", { dates });
  if (ANALYTICS.adsId && ANALYTICS.adsInterviewLabel) {
    gtag("event", "conversion", { send_to: `${ANALYTICS.adsId}/${ANALYTICS.adsInterviewLabel}`, transaction_id: `interview-${leadId}` });
  }
  fbq("track", "Schedule", {}, { eventID: `interview-${leadId}` });
}

/** 公式 LINE ボタンを押した */
export function trackLineClick(place: string) {
  gtag("event", "line_click", { place });
  fbq("track", "Contact", { content_name: "line" });
}

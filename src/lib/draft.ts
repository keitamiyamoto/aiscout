/** 入力途中の回答をブラウザ (localStorage) に保存する。サーバーには送らない。 */
import type { AnswersDraft, ContactDraft } from "@/lib/schemas";

const DRAFT_KEY = "aiscout:draft:v1";
const LAST_KEY = "aiscout:last";
const UTM_KEY = "aiscout:utm";

export type Draft = { answers: AnswersDraft; contact: Omit<ContactDraft, "consent">; updatedAt: number };
export type Utm = { utmSource?: string; utmMedium?: string; utmCampaign?: string; gclid?: string; fbclid?: string };

function read<T>(storage: () => Storage, key: string): T | null {
  try {
    const raw = storage().getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(storage: () => Storage, key: string, value: unknown) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, JSON.stringify(value));
  } catch {
    /* プライベートモード等で保存できなくても診断は続けられる */
  }
}
const local = () => window.localStorage;
const session = () => window.sessionStorage;

export const loadDraft = () => read<Draft>(local, DRAFT_KEY);
export const saveDraft = (d: Omit<Draft, "updatedAt">) => write(local, DRAFT_KEY, { ...d, updatedAt: Date.now() });
export const clearDraft = () => write(local, DRAFT_KEY, null);

export const loadLastToken = () => read<string>(local, LAST_KEY);
export const saveLastToken = (token: string) => write(local, LAST_KEY, token);

export function captureUtm(search: string) {
  const p = new URLSearchParams(search);
  const utm: Utm = {
    utmSource: p.get("utm_source") ?? undefined,
    utmMedium: p.get("utm_medium") ?? undefined,
    utmCampaign: p.get("utm_campaign") ?? undefined,
    gclid: p.get("gclid") ?? undefined,
    fbclid: p.get("fbclid") ?? undefined,
  };
  if (Object.values(utm).some(Boolean)) write(session, UTM_KEY, utm);
}
export const loadUtm = () => read<Utm>(session, UTM_KEY) ?? {};

/** 回答済みの質問数 (= 次に答えるべき質問の番号) */
export function answeredCount(answers: AnswersDraft, keys: readonly string[]): number {
  const i = keys.findIndex((k) => (answers as Record<string, unknown>)[k] === undefined);
  return i === -1 ? keys.length : i;
}

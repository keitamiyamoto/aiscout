/**
 * プレビューモード: DATABASE_URL が未設定のとき (デモ用のデプロイ) に使う。
 * 回答を DB に保存せず、結果ページの URL に回答そのものを入れて毎回計算し直す。
 * 連絡先 (電話・メール) は URL に入れない。
 */
import { answersSchema, type Answers } from "@/lib/schemas";

export const PREVIEW_PREFIX = "p.";

export function isPreviewMode(): boolean {
  return !process.env.DATABASE_URL;
}

export function isPreviewToken(token: string): boolean {
  return token.startsWith(PREVIEW_PREFIX);
}

export function encodePreviewToken(answers: Answers, name: string): string {
  return PREVIEW_PREFIX + Buffer.from(JSON.stringify({ a: answers, n: name }), "utf8").toString("base64url");
}

export function decodePreviewToken(token: string): { answers: Answers; name: string } | null {
  if (!isPreviewToken(token) || token.length > 6000) return null;
  try {
    const raw = JSON.parse(Buffer.from(token.slice(PREVIEW_PREFIX.length), "base64url").toString("utf8")) as { a?: unknown; n?: unknown };
    const answers = answersSchema.safeParse(raw.a);
    if (!answers.success) return null;
    return { answers: answers.data, name: typeof raw.n === "string" ? raw.n.slice(0, 60) : "" };
  } catch {
    return null;
  }
}

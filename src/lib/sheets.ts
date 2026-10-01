import "server-only";

/**
 * Google スプレッドシートへの転記 + Chatwork 通知。
 * スプレッドシートに置いた GAS (docs/gas/sheets-webhook.gs) をウェブアプリとして公開し、そこへ POST する。
 *
 * 必要な環境変数:
 *   SHEETS_WEBHOOK_URL    GAS ウェブアプリの URL (https://script.google.com/macros/s/.../exec)
 *   SHEETS_WEBHOOK_TOKEN  GAS のスクリプトプロパティ WEBHOOK_TOKEN と同じ合言葉
 *   SHEETS_TAB_NAME       書き込むタブ名 (省略時「市場価値調べるくん」)
 * 未設定なら何もしない (configured: false を返す)。
 */
export const DEFAULT_TAB_NAME = "市場価値調べるくん";

export function isSheetsConfigured(): boolean {
  return Boolean(process.env.SHEETS_WEBHOOK_URL && process.env.SHEETS_WEBHOOK_TOKEN);
}

export type SheetPayload = {
  headers: string[];
  values: (string | number)[];
  /** Chatwork に送る本文 (null なら通知しない) */
  notify: string | null;
};

export async function appendSheetRow(payload: SheetPayload): Promise<{ ok: boolean; error?: string; configured: boolean }> {
  if (!isSheetsConfigured()) return { ok: false, configured: false, error: "not configured" };
  try {
    const res = await fetch(process.env.SHEETS_WEBHOOK_URL!, {
      method: "POST",
      // GAS は application/json だと事前確認が要るので text/plain で送り、GAS 側で JSON.parse する
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        token: process.env.SHEETS_WEBHOOK_TOKEN,
        sheet: process.env.SHEETS_TAB_NAME || DEFAULT_TAB_NAME,
        ...payload,
      }),
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`GAS ${res.status}: ${text.slice(0, 300)}`);
    let body: { ok?: boolean; error?: string } = {};
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`GAS の応答が JSON ではありません (公開設定を確認してください): ${text.slice(0, 200)}`);
    }
    if (!body.ok) throw new Error(`GAS: ${body.error ?? "unknown error"}`);
    return { ok: true, configured: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sheets] append failed:", message);
    return { ok: false, configured: true, error: message };
  }
}

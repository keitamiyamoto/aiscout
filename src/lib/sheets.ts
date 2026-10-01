import "server-only";
import { JWT } from "google-auth-library";

/**
 * Google スプレッドシートへ1行追記する。
 * 必要な環境変数:
 *   GOOGLE_SHEETS_ID             スプレッドシートのID (URL の /d/ と /edit の間)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL サービスアカウントのメール (シートに編集者として共有しておく)
 *   GOOGLE_PRIVATE_KEY           サービスアカウントの秘密鍵 (改行は \n でOK)
 *   GOOGLE_SHEETS_RANGE          省略時 "A1" (= いちばん左のシート)。別のシートに書くなら "シート名!A1"
 * 未設定なら何もしない (configured: false を返す)。
 */
export function isSheetsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

export async function appendSheetRow(values: (string | number)[]): Promise<{ ok: boolean; error?: string; configured: boolean }> {
  if (!isSheetsConfigured()) return { ok: false, configured: false, error: "not configured" };
  const sheetId = process.env.GOOGLE_SHEETS_ID!;
  // シート名を省くと先頭のシートに追記される (日本語環境の「シート1」でも動くように)
  const range = process.env.GOOGLE_SHEETS_RANGE || "A1";
  try {
    const client = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const { token } = await client.getAccessToken();
    if (!token) throw new Error("no access token");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    });
    if (!res.ok) throw new Error(`Sheets API ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return { ok: true, configured: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sheets] append failed:", message);
    return { ok: false, configured: true, error: message };
  }
}

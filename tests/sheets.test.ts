import { afterEach, describe, expect, it, vi } from "vitest";
import { appendSheetRow, DEFAULT_TAB_NAME } from "@/lib/sheets";
import { LEAD_HEADERS, leadMessage, leadRow, type LeadLike } from "@/lib/lead-columns";
import { diagnose } from "@/lib/engine";
import { SAMPLE } from "./fixtures";

const lead: LeadLike = {
  id: "lead_1",
  token: "tok123",
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "taro@example.com",
  contactTimes: ["weekday-night"],
  answers: SAMPLE,
  result: diagnose(SAMPLE),
  status: "new",
  memo: "",
  interviewRequestedAt: new Date("2026-10-01T03:00:00Z"),
  interviewDates: ["2026-10-02", "2026-10-05"],
  interviewTime: "night",
  interviewNote: "IT営業に挑戦したい",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: null,
  createdAt: new Date("2026-10-01T02:00:00Z"),
};

describe("leadMessage", () => {
  it("面談申込の通知に連絡先・希望日・結果URLが入る", () => {
    const row = leadRow(lead, "面談申込", "https://ai-scouter.jp");
    const msg = leadMessage(row, "面談申込");
    expect(msg).toContain("【面談申込】山田 太郎 さん");
    expect(msg).toContain("090-1234-5678");
    expect(msg).toContain("10月2日(金)・10月5日(月)");
    expect(msg).toContain("夜 (18〜21時)");
    expect(msg).toContain("IT営業に挑戦したい");
    expect(msg).toContain("https://ai-scouter.jp/result/tok123");
    expect(msg.startsWith("[info][title]")).toBe(true);
  });

  it("診断完了の通知には面談の行が入らない", () => {
    const msg = leadMessage(leadRow(lead, "診断完了"), "診断完了");
    expect(msg).toContain("【新規診断】");
    expect(msg).not.toContain("面談希望日");
  });

  it("見出しと値の数が一致する", () => {
    expect(leadRow(lead, "診断完了")).toHaveLength(LEAD_HEADERS.length);
  });
});

describe("appendSheetRow", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("未設定なら送らない", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "");
    vi.stubEnv("SHEETS_WEBHOOK_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await appendSheetRow({ headers: ["a"], values: [1], notify: null })).toMatchObject({ ok: false, configured: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("トークン・タブ名・見出し・値・通知文を GAS に送る", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "https://script.google.com/macros/s/x/exec");
    vi.stubEnv("SHEETS_WEBHOOK_TOKEN", "secret");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, notified: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await appendSheetRow({ headers: ["氏名"], values: ["山田"], notify: "hi" });
    expect(res).toEqual({ ok: true, configured: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://script.google.com/macros/s/x/exec");
    expect(JSON.parse(init.body)).toEqual({ token: "secret", sheet: DEFAULT_TAB_NAME, headers: ["氏名"], values: ["山田"], notify: "hi" });
  });

  it("GAS がエラーを返したら失敗として記録する", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "https://script.google.com/macros/s/x/exec");
    vi.stubEnv("SHEETS_WEBHOOK_TOKEN", "secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "invalid token" }), { status: 200 })));
    const res = await appendSheetRow({ headers: ["a"], values: [1], notify: null });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("invalid token");
  });

  it("ログイン画面などJSONでない応答は、公開設定の誤りとして失敗にする", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "https://script.google.com/macros/s/x/exec");
    vi.stubEnv("SHEETS_WEBHOOK_TOKEN", "secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Sign in</html>", { status: 200 })));
    const res = await appendSheetRow({ headers: ["a"], values: [1], notify: null });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("公開設定");
  });
});

import { describe, expect, it } from "vitest";
import { decodePreviewToken, encodePreviewToken, isPreviewToken } from "@/lib/preview";
import { SAMPLE } from "./fixtures";

describe("preview token", () => {
  it("回答と名前を往復できる", () => {
    const t = encodePreviewToken(SAMPLE, "山田 太郎");
    expect(isPreviewToken(t)).toBe(true);
    expect(t).not.toContain("0901");
    const d = decodePreviewToken(t);
    expect(d?.name).toBe("山田 太郎");
    expect(d?.answers.jobCategory).toBe("sales");
  });

  it("壊れたトークンは null", () => {
    expect(decodePreviewToken("p.!!!")).toBeNull();
    expect(decodePreviewToken("p." + Buffer.from(JSON.stringify({ a: { age: "x" } })).toString("base64url"))).toBeNull();
  });
});

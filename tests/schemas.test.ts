import { describe, expect, it } from "vitest";
import { contactSchema, toFieldErrors } from "@/lib/schemas";
import { normalizePhone, validatePhone } from "@/lib/validate";

const valid = { name: "山田 太郎", nameKana: "やまだ たろう", phone: "09012345678", email: "taro@example.com", contactTimes: ["weekday-pm"], consent: true };

describe("contactSchema", () => {
  it("正しい入力を通す", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("空の入力では必須項目 (お名前・電話番号・同意) のエラーだけを返す", () => {
    const r = contactSchema.safeParse({ name: "", nameKana: "", phone: "", email: "", contactTimes: [], consent: false });
    expect(r.success).toBe(false);
    const e = toFieldErrors(r.error!);
    expect(Object.keys(e).sort()).toEqual(["consent", "name", "phone"]);
    expect(e.name).toBe("氏名を入力してください");
  });

  it("ふりがな・メール・時間帯は空でも通り、時間帯は「いつでも」になる", () => {
    const r = contactSchema.safeParse({ ...valid, nameKana: "", email: "", contactTimes: [] });
    expect(r.success).toBe(true);
    expect(r.success && r.data.contactTimes).toEqual(["anytime"]);
  });

  it("メールを入れた場合は形式を確認する", () => {
    const e = toFieldErrors(contactSchema.safeParse({ ...valid, email: "taro@" }).error!);
    expect(e.email).toBeTruthy();
  });

  it("ふりがな・電話番号のいたずら入力を弾く", () => {
    const e = toFieldErrors(contactSchema.safeParse({ ...valid, nameKana: "yamada", phone: "0000000000" }).error!);
    expect(e.nameKana).toContain("ひらがな");
    expect(e.phone).toBe("電話番号が正しくありません");
  });
});

describe("phone", () => {
  it("全角数字・ハイフンを正規化して検証できる", () => {
    expect(validatePhone(normalizePhone("０９０ー１２３４ー５６７８"))).toBeNull();
    expect(validatePhone("1234567890")).toContain("0から始まる");
  });
});

import { describe, expect, it } from "vitest";
import { contactSchema, toFieldErrors } from "@/lib/schemas";
import { normalizePhone, validatePhone } from "@/lib/validate";

const valid = { name: "山田 太郎", nameKana: "やまだ たろう", phone: "09012345678", email: "taro@example.com", contactTimes: ["weekday-pm"], consent: true };

describe("contactSchema", () => {
  it("正しい入力を通す", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("空の入力では全項目のエラーをまとめて返す", () => {
    const r = contactSchema.safeParse({ name: "", nameKana: "", phone: "", email: "", contactTimes: [], consent: false });
    expect(r.success).toBe(false);
    const e = toFieldErrors(r.error!);
    expect(Object.keys(e).sort()).toEqual(["consent", "contactTimes", "email", "name", "nameKana", "phone"]);
    expect(e.name).toBe("氏名を入力してください");
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

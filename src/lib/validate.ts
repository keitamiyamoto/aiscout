const KANA_RE = /^[ぁ-ゟ゠-ヿー\s　]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export function isKana(value: string): boolean {
  return KANA_RE.test(value);
}

/** 電話番号: 0 から始まる数字10〜11桁、同じ数字の連続 (0000000000 等) は不可 */
export function validatePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length !== 10 && digits.length !== 11) return "電話番号は10桁または11桁で入力してください";
  if (/^(\d)\1+$/.test(digits)) return "電話番号が正しくありません";
  if (!digits.startsWith("0")) return "電話番号は0から始まる番号を入力してください";
  return null;
}

export function validateEmail(raw: string): string | null {
  if (!EMAIL_RE.test(raw.trim())) return "メールアドレスの形式が正しくありません";
  return null;
}

/** 同じ文字だけの連続 (ああああ / 1111) や 2文字未満は名前として不可 */
export function validateName(raw: string): string | null {
  const v = raw.replace(/[\s　]/g, "");
  if (v.length < 2) return "氏名を入力してください";
  if (/^(.)\1+$/u.test(v)) return "氏名が正しくありません";
  return null;
}

/** 全角数字・ハイフンを半角に */
export function normalizePhone(raw: string): string {
  return raw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[ー－‐―]/g, "-");
}

import { z } from "zod";
import { OPTIONS, PREFECTURES, type OptionKey } from "@/lib/questions";
import { isKana, validateEmail, validateName, validatePhone } from "@/lib/validate";
import { MAX_INTERVIEW_DATES, isSelectableDate } from "@/lib/interview-dates";

const values = <K extends OptionKey>(key: K) => OPTIONS[key].map((o) => o.value) as [string, ...string[]];
const one = (key: OptionKey, message: string) => z.enum(values(key), { error: message });
const many = (key: OptionKey, message: string) => z.array(z.enum(values(key))).min(1, message);
const income = (message: string) => z.number({ error: message }).int().min(0).max(5000);
const level = z.number().int().min(0).max(5);

export const answersSchema = z.object({
  age: one("age", "年齢を選んでください"),
  jobCategory: one("jobCategory", "職種を選んでください"),
  industry: one("industry", "業界を選んでください"),
  employmentType: one("employmentType", "雇用形態を選んでください"),
  companySize: one("companySize", "従業員数を選んでください"),
  prefecture: z.enum(PREFECTURES as [string, ...string[]], { error: "都道府県を選んでください" }),
  currentIncome: income("現在の年収を入力してください"),
  jobYears: one("jobYears", "経験年数を選んでください"),
  management: one("management", "マネジメント経験を選んでください"),
  jobChanges: one("jobChanges", "転職回数を選んでください"),
  education: one("education", "最終学歴を選んでください"),
  skillLevels: z.partialRecord(z.enum(values("skillLevels")), level).default({}),
  skills: many("skills", "1つ以上選んでください"),
  achievements: many("achievements", "1つ以上選んでください"),
  motivation: one("motivation", "1つ選んでください"),
  strength: one("strength", "1つ選んでください"),
  reputation: one("reputation", "1つ選んでください"),
  workStyle: one("workStyle", "1つ選んでください"),
  interests: many("interests", "1つ以上選んでください").max(3, "3つまで選べます"),
  priority: one("priority", "1つ選んでください"),
  desiredIncome: income("希望年収を入力してください"),
  timing: one("timing", "時期を選んでください"),
});
export type Answers = z.infer<typeof answersSchema>;
/** 入力途中の回答 (ブラウザに保存する形) */
export type AnswersDraft = Partial<Answers>;

/** 独自のバリデーション関数 (null ならOK) を zod のフィールドにする */
const checked = (max: number, check: (v: string) => string | null) =>
  z
    .string()
    .trim()
    .max(max)
    .superRefine((v, ctx) => {
      const message = check(v);
      if (message) ctx.addIssue({ code: "custom", message });
    });

export const contactSchema = z.object({
  name: checked(60, validateName),
  nameKana: checked(60, (v) => (!v ? "ふりがなを入力してください" : isKana(v) ? null : "ふりがなはひらがな・カタカナで入力してください")),
  phone: checked(20, validatePhone),
  email: checked(200, validateEmail),
  contactTimes: z.array(z.enum(values("contactTimes"))).min(1, "連絡のつきやすい時間帯を1つ以上選んでください"),
  consent: z.literal(true, { error: "利用規約・プライバシーポリシーへの同意が必要です" }),
});
export type Contact = z.infer<typeof contactSchema>;
export type ContactDraft = Omit<Contact, "consent"> & { consent: boolean };

export function emptyContact(): ContactDraft {
  return { name: "", nameKana: "", phone: "", email: "", contactTimes: [], consent: false };
}

/** カジュアル面談 (オンライン) の申込: 候補日を最大3つ + 時間帯 */
export const interviewSchema = z.object({
  dates: z
    .array(z.string().refine((v) => isSelectableDate(v), "選べない日付が含まれています"))
    .min(1, "ご希望の日付を1つ以上選んでください")
    .max(MAX_INTERVIEW_DATES, `日付は${MAX_INTERVIEW_DATES}つまで選べます`)
    .refine((v) => new Set(v).size === v.length, "同じ日付が重複しています"),
  time: z.enum(values("interviewTime"), { error: "ご希望の時間帯を選んでください" }),
  note: z.string().trim().max(500, "500文字以内で入力してください").default(""),
});
export type InterviewInput = z.infer<typeof interviewSchema>;

/** zod のエラーを { フィールド名: メッセージ } に */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

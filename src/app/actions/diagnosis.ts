"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { diagnose } from "@/lib/engine";
import { answersSchema, contactSchema, interviewSchema, toFieldErrors } from "@/lib/schemas";
import { normalizePhone } from "@/lib/validate";
import { countRecentByPhone, createLead, getLeadByToken, markSheetSync, requestInterview } from "@/lib/leads";
import { appendSheetRow } from "@/lib/sheets";
import { leadRow } from "@/lib/lead-columns";

export type SubmitResult =
  | { ok: true; token: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; answersInvalid?: boolean };

type Meta = { utmSource?: string; utmMedium?: string; utmCampaign?: string; website?: string };

const MAX_PER_PHONE_PER_HOUR = 3;

export async function submitDiagnosisAction(answersInput: unknown, contactInput: unknown, meta: Meta = {}): Promise<SubmitResult> {
  // ボット対策: 画面には出ない入力欄 (website) に値があれば破棄する
  if (meta.website) return { ok: false, error: "送信できませんでした。時間をおいてもう一度お試しください。" };

  const answers = answersSchema.safeParse(answersInput);
  if (!answers.success) {
    return { ok: false, error: "未回答の質問があります。最初からやり直してください。", answersInvalid: true, fieldErrors: toFieldErrors(answers.error) };
  }
  const raw = (contactInput ?? {}) as Record<string, unknown>;
  const contact = contactSchema.safeParse({ ...raw, phone: normalizePhone(String(raw.phone ?? "")) });
  if (!contact.success) {
    return { ok: false, error: "入力内容をご確認ください", fieldErrors: toFieldErrors(contact.error) };
  }

  if ((await countRecentByPhone(contact.data.phone)) >= MAX_PER_PHONE_PER_HOUR) {
    return { ok: false, error: "短時間に何度も送信されています。しばらく時間をおいてからお試しください。" };
  }

  const result = diagnose(answers.data);
  const h = await headers();
  const lead = await createLead(answers.data, result, contact.data, { ...meta, userAgent: h.get("user-agent") ?? undefined });

  const sheet = await appendSheetRow(leadRow(lead, "診断完了"));
  if (sheet.configured) await markSheetSync(lead.id, sheet.ok, sheet.error);

  return { ok: true, token: lead.token };
}

export type InterviewResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function requestInterviewAction(token: string, input: unknown): Promise<InterviewResult> {
  const lead = await getLeadByToken(token);
  if (!lead) return { ok: false, error: "診断結果が見つかりません" };
  const parsed = interviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "入力内容をご確認ください", fieldErrors: toFieldErrors(parsed.error) };

  const updated = await requestInterview(token, parsed.data);
  const sheet = await appendSheetRow(leadRow(updated, "面談申込"));
  if (sheet.configured) await markSheetSync(updated.id, sheet.ok, sheet.error);

  revalidatePath(`/result/${token}`);
  return { ok: true };
}

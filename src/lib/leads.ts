import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ENGINE_VERSION, type DiagnosisResult } from "@/lib/engine";
import type { Answers, Contact, InterviewInput } from "@/lib/schemas";
import type { LeadStatus } from "@/lib/lead-columns";

export type LeadMeta = { utmSource?: string; utmMedium?: string; utmCampaign?: string; gclid?: string; fbclid?: string; userAgent?: string };

export function newToken(): string {
  return randomBytes(18).toString("base64url");
}

export async function createLead(answers: Answers, result: DiagnosisResult, contact: Contact, meta: LeadMeta) {
  return prisma.lead.create({
    data: {
      token: newToken(),
      name: contact.name,
      nameKana: contact.nameKana,
      phone: contact.phone,
      email: contact.email,
      contactTimes: contact.contactTimes,
      age: answers.age,
      prefecture: answers.prefecture,
      jobCategory: answers.jobCategory,
      employmentType: answers.employmentType,
      currentIncome: answers.currentIncome,
      desiredIncome: answers.desiredIncome,
      timing: answers.timing,
      marketValue: result.marketValue,
      topJob: result.jobs[0]?.name ?? "",
      answers,
      result,
      engineVersion: ENGINE_VERSION,
      utmSource: meta.utmSource?.slice(0, 100) || null,
      utmMedium: meta.utmMedium?.slice(0, 100) || null,
      utmCampaign: meta.utmCampaign?.slice(0, 100) || null,
      gclid: meta.gclid?.slice(0, 200) || null,
      fbclid: meta.fbclid?.slice(0, 300) || null,
      userAgent: meta.userAgent?.slice(0, 300) || null,
    },
  });
}

export async function getLeadByToken(token: string) {
  if (!/^[\w-]{10,64}$/.test(token)) return null;
  return prisma.lead.findUnique({ where: { token } });
}

/** 同じ電話番号からの短時間の連続送信 (いたずら・連打) を数える */
export async function countRecentByPhone(phone: string, minutes = 60): Promise<number> {
  return prisma.lead.count({ where: { phone, createdAt: { gte: new Date(Date.now() - minutes * 60_000) } } });
}

export async function requestInterview(token: string, input: InterviewInput) {
  return prisma.lead.update({
    where: { token },
    data: {
      interviewRequestedAt: new Date(),
      interviewMethod: "online",
      interviewDates: [...input.dates].sort(),
      interviewTime: input.time,
      interviewNote: input.note || null,
      status: "new",
    },
  });
}

export async function markSheetSync(id: string, ok: boolean, error?: string): Promise<void> {
  await prisma.lead.update({
    where: { id },
    data: ok ? { sheetSyncedAt: new Date(), sheetSyncError: null } : { sheetSyncError: (error ?? "unknown").slice(0, 500) },
  });
}

export async function listLeads(opts: { status?: string; interviewOnly?: boolean; take?: number } = {}) {
  return prisma.lead.findMany({
    where: {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.interviewOnly ? { interviewRequestedAt: { not: null } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 200,
  });
}

export async function updateLeadStatus(id: string, status: LeadStatus, memo: string) {
  return prisma.lead.update({ where: { id }, data: { status, memo: memo.slice(0, 1000) } });
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { LEAD_STATUS, type LeadStatus } from "@/lib/lead-columns";
import { updateLeadStatus } from "@/lib/leads";

/** proxy.ts の Basic 認証を通った要求だけが来る想定だが、念のためここでも確認する */
async function assertAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  const auth = (await headers()).get("authorization") ?? "";
  if (!password || !auth.startsWith("Basic ")) throw new Error("unauthorized");
  const decoded = atob(auth.slice(6));
  if (decoded !== `${process.env.ADMIN_USER || "admin"}:${password}`) throw new Error("unauthorized");
}

export async function updateLeadStatusAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const memo = String(formData.get("memo") ?? "");
  if (!id || !LEAD_STATUS.some((s) => s.value === status)) return;
  await updateLeadStatus(id, status as LeadStatus, memo);
  revalidatePath("/admin");
}

import { listLeads } from "@/lib/leads";
import { LEAD_HEADERS, leadRow, toCsv } from "@/lib/lead-columns";

export const dynamic = "force-dynamic";

/** 診断リストの CSV ダウンロード (/admin 配下なので proxy.ts の Basic 認証がかかる) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const leads = await listLeads({
    status: url.searchParams.get("status") || undefined,
    interviewOnly: url.searchParams.get("interview") === "1",
    take: 5000,
  });
  const appUrl = process.env.APP_URL || url.origin;
  const csv = toCsv([LEAD_HEADERS, ...leads.map((l) => leadRow(l, l.interviewRequestedAt ? "面談申込" : "診断完了", appUrl))]);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aiscout-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

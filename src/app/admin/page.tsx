import Link from "next/link";
import { Header } from "@/components/Header";
import { Badge, Heading } from "@/components/ui";
import { FormBusy, SubmitButton } from "@/components/FormPending";
import { listLeads } from "@/lib/leads";
import { LEAD_STATUS, statusLabel } from "@/lib/lead-columns";
import { optionLabel } from "@/lib/questions";
import { formatJst } from "@/lib/format";
import { formatInterviewDate } from "@/lib/interview-dates";
import { updateLeadStatusAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "管理画面", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string; interview?: string }> }) {
  const { status, interview } = await searchParams;
  const interviewOnly = interview === "1";
  const leads = await listLeads({ status: status || undefined, interviewOnly });
  const query = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, interview, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-xs font-semibold ${on ? "border-ink-900 bg-ink-900 text-white" : "border-sand-300 bg-white text-ink-700 hover:border-ink-300"}`;

  return (
    <>
      <Header right={<Badge tone="indigo">管理画面</Badge>} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Heading className="text-2xl">診断リスト</Heading>
            <p className="mt-1 text-sm text-ink-500">新しい順に最大200件を表示しています。{leads.length}件</p>
          </div>
          <a href={`/admin/export${query({})}`} className="rounded-full bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700">
            CSVダウンロード
          </a>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/admin${query({ status: undefined })}`} className={chip(!status)}>
            すべて
          </Link>
          {LEAD_STATUS.map((s) => (
            <Link key={s.value} href={`/admin${query({ status: s.value })}`} className={chip(status === s.value)}>
              {s.label}
            </Link>
          ))}
          <span className="mx-1 w-px bg-sand-300" />
          <Link href={`/admin${query({ interview: interviewOnly ? undefined : "1" })}`} className={chip(interviewOnly)}>
            面談申込のみ
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto rounded-3xl border border-sand-200 bg-white shadow-soft">
          <table className="w-full min-w-[64rem] text-sm">
            <thead className="bg-sand-100 text-left text-xs text-ink-700">
              <tr>
                <th className="px-4 py-3">日時</th>
                <th className="px-4 py-3">氏名 / 連絡先</th>
                <th className="px-4 py-3">属性</th>
                <th className="px-4 py-3">年収 (現在→市場価値 / 希望)</th>
                <th className="px-4 py-3">適職1位</th>
                <th className="px-4 py-3">面談</th>
                <th className="px-4 py-3">対応状況・メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 align-top">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-500">
                    まだデータがありません
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-500">{formatJst(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-900">{l.name}</p>
                    <p className="text-xs text-ink-500">{l.nameKana}</p>
                    <p className="mt-1 text-xs">
                      <a href={`tel:${l.phone}`} className="text-leaf-700 underline">
                        {l.phone}
                      </a>
                    </p>
                    <p className="text-xs text-ink-500">{l.email}</p>
                    <p className="text-xs text-ink-500">{l.contactTimes.map((t) => optionLabel("contactTimes", t)).join("・")}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-700">
                    <p>
                      {optionLabel("age", l.age)} / {l.prefecture}
                    </p>
                    <p>
                      {optionLabel("jobCategory", l.jobCategory)} / {optionLabel("employmentType", l.employmentType)}
                    </p>
                    <p>転職時期: {optionLabel("timing", l.timing)}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    <p>
                      {l.currentIncome} → <span className="font-bold text-leaf-700">{l.marketValue}万円</span>
                    </p>
                    <p className="text-ink-500">希望 {l.desiredIncome}万円</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {l.topJob}
                    <p>
                      <Link href={`/result/${l.token}`} target="_blank" className="text-leaf-700 underline">
                        結果を見る
                      </Link>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {l.interviewRequestedAt ? (
                      <>
                        <Badge tone="sun">申込あり</Badge>
                        <p className="mt-1 font-bold">オンライン</p>
                        {l.interviewDates.map((d, i) => (
                          <p key={d}>
                            第{i + 1}希望 {formatInterviewDate(d)}
                          </p>
                        ))}
                        {l.interviewTime && <p className="text-ink-500">{optionLabel("interviewTime", l.interviewTime)}</p>}
                        {l.interviewNote && <p className="mt-1 max-w-[14rem] whitespace-pre-wrap text-ink-500">{l.interviewNote}</p>}
                      </>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateLeadStatusAction} className="flex w-56 flex-col gap-2">
                      <FormBusy label="保存しています…" />
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="rounded-lg border border-sand-300 bg-white px-2 py-1.5 text-xs" aria-label="対応状況">
                        {LEAD_STATUS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <textarea name="memo" defaultValue={l.memo} rows={2} className="rounded-lg border border-sand-300 px-2 py-1.5 text-xs" placeholder="メモ" aria-label="メモ" />
                      <SubmitButton size="sm" variant="secondary" pendingLabel="保存中…">
                        保存 ({statusLabel(l.status)})
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

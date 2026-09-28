import Link from "next/link";
import type { LegalBlock, LegalDoc } from "@/content/legal";
import { Logo } from "@/components/brand/Logo";

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p className="leading-7 text-ink-700">{block}</p>;
  if ("list" in block) {
    return (
      <ol className="list-decimal space-y-1.5 pl-6 leading-7 text-ink-700 marker:text-ink-500">
        {block.list.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr>
            {block.table.head.map((h) => (
              <th key={h} className="border border-sand-200 bg-sand-100 px-3 py-2 text-left font-semibold text-ink-900">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-sand-200 px-3 py-2 align-top leading-6 text-ink-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
      <Link href="/" className="inline-block">
        <Logo size="sm" />
      </Link>
      <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-ink-900">{doc.title}</h1>
      <div className="mt-6 space-y-4 text-[15px]">
        {doc.intro.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>
      <div className="mt-10 space-y-10">
        {doc.sections.map((s) => (
          <section key={s.title} className="space-y-3 text-[15px]">
            <h2 className="font-display text-lg font-bold text-ink-900">{s.title}</h2>
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-2xl border border-sand-200 bg-white p-5 text-sm leading-7 text-ink-700">
        {doc.footer.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="mt-8 text-sm">
        <Link href="/" className="font-semibold text-leaf-700 hover:underline">
          ← トップへ戻る
        </Link>
      </p>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-ink-500">URLが間違っているか、ページが削除された可能性があります。</p>
      <Link href="/" className="mt-6 font-semibold text-leaf-700 hover:underline">
        トップへ戻る
      </Link>
    </main>
  );
}

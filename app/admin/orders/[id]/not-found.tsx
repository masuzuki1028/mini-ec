import Link from "next/link";

export default function AdminOrderNotFound() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold">注文が見つかりませんでした</h2>
      <p className="mt-4 text-slate-500">
        注文が存在しないか、すでに削除されている可能性があります。
      </p>
      <Link
        href="/admin/orders"
        className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        注文一覧に戻る
      </Link>
    </div>
  );
}

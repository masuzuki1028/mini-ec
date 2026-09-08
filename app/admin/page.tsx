import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "管理トップ | MAME COFFEE",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ count: productCount, error: productError }, { count: orderCount, error: orderError }] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

  if (productError) {
    throw new Error(`商品数の取得に失敗しました: ${productError.message}`);
  }

  if (orderError) {
    throw new Error(`注文数の取得に失敗しました: ${orderError.message}`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">管理トップ</h2>
        <p className="mt-3 text-slate-500">
          商品と注文の状況を確認できます。
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">商品数</p>
          <p className="mt-4 text-4xl font-bold">{productCount ?? 0}</p>
          <Link
            href="/admin/products"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            商品管理へ
          </Link>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">注文数</p>
          <p className="mt-4 text-4xl font-bold">{orderCount ?? 0}</p>
          <Link
            href="/admin/orders"
            className="mt-6 inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-bold transition hover:bg-slate-50"
          >
            注文管理へ
          </Link>
        </section>
      </div>
    </div>
  );
}

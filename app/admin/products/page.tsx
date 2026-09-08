import Image from "next/image";
import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { createClient } from "@/lib/supabase/server";

type AdminProduct = {
  id: string;
  name: string | null;
  price_jpy: number | null;
  image_url: string | null;
  stock_quantity: number | null;
  created_at: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatPrice(price: number | null) {
  return `${(price ?? 0).toLocaleString("ja-JP")}円`;
}

function formatDate(date: string | null) {
  return date ? dateFormatter.format(new Date(date)) : "未設定";
}

export const metadata = {
  title: "商品管理 | MAME COFFEE",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price_jpy, image_url, stock_quantity, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`商品一覧の取得に失敗しました: ${error.message}`);
  }

  const products = (data ?? []) as unknown as AdminProduct[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">商品管理</h2>
          <p className="mt-3 text-slate-500">登録済み商品の在庫や価格を管理します。</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          新規追加
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-900 text-left text-white">
              <tr>
                <th className="px-5 py-4 font-bold">画像</th>
                <th className="px-5 py-4 font-bold">商品名</th>
                <th className="px-5 py-4 font-bold">価格</th>
                <th className="px-5 py-4 font-bold">在庫</th>
                <th className="px-5 py-4 font-bold">作成日</th>
                <th className="px-5 py-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="align-middle">
                  <td className="px-5 py-4">
                    <div className="relative size-16 overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={
                          product.image_url ??
                          "https://picsum.photos/600/600?random=admin-product"
                        }
                        alt={product.name ?? "商品画像"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {product.name ?? "名称未設定"}
                  </td>
                  <td className="px-5 py-4">{formatPrice(product.price_jpy)}</td>
                  <td className="px-5 py-4">{product.stock_quantity ?? 0}</td>
                  <td className="px-5 py-4">{formatDate(product.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-start gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        編集
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name ?? "名称未設定"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-500">
            商品はまだ登録されていません。
          </div>
        ) : null}
      </div>
    </div>
  );
}

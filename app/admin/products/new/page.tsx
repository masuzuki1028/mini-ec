import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export const metadata = {
  title: "商品新規追加 | MAME COFFEE",
};

export default function AdminProductNewPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex text-sm font-bold text-slate-500 transition hover:text-slate-950"
        >
          商品管理に戻る
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">商品を新規追加</h2>
        <p className="mt-3 text-slate-500">
          お客さん側の商品一覧に表示する商品を登録します。
        </p>
      </div>

      <ProductForm action={createProduct} submitLabel="追加する" />
    </div>
  );
}

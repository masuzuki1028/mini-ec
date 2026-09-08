import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../../actions";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type AdminProduct = {
  id: string;
  name: string | null;
  price_jpy: number | null;
  image_url: string | null;
  description: string | null;
  stock_quantity: number | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const metadata = {
  title: "商品編集 | MAME COFFEE",
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price_jpy, image_url, description, stock_quantity")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`商品の取得に失敗しました: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const product = data as unknown as AdminProduct;
  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex text-sm font-bold text-slate-500 transition hover:text-slate-950"
        >
          商品管理に戻る
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">商品を編集</h2>
        <p className="mt-3 text-slate-500">{product.name ?? "名称未設定"} を編集します。</p>
      </div>

      <ProductForm
        action={updateProductWithId}
        submitLabel="更新する"
        initialValue={product}
      />
    </div>
  );
}

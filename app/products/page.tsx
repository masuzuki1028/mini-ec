import { ProductCard, type ProductCardProduct } from "@/components/products/product-card";
import { createClient } from "@/lib/supabase/server";

type Product = ProductCardProduct & {
  created_at: string | null;
};

export const metadata = {
  title: "今月のコーヒー豆 | MAME COFFEE",
  description: "季節限定の自家焙煎コーヒー豆を一覧でご覧いただけます。",
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price_jpy, stock_quantity, image_url, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`商品一覧の取得に失敗しました: ${error.message}`);
  }

  const products = (data ?? []) as Product[];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
            MONTHLY BEANS
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            今月のコーヒー豆
          </h1>
          <p className="mt-4 leading-7 text-stone-600">
            季節限定の自家焙煎豆を、少量ずつ丁寧に販売しています。気になる豆を選んで、香りや味わいの詳細をご覧ください。
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              ☕
            </div>
            <h2 className="text-xl font-semibold">商品はまだありません</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
              公開中の商品が登録されると、このページに一覧表示されます。
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-stone-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>小さな焙煎店 MAME COFFEE</p>
          <div className="flex flex-wrap gap-4">
            <span>店舗情報</span>
            <span>配送・返品について</span>
            <span>お問い合わせ</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

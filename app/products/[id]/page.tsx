import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { createClient } from "@/lib/supabase/server";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  price_jpy: number | null;
  weight_grams: number | null;
  origin: string | null;
  roast_level: string | null;
  flavor_notes: string | null;
  shop_comment: string | null;
  stock_quantity: number | null;
  sales_start_date: string | null;
  sales_end_date: string | null;
  image_url: string | null;
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
  return date ? dateFormatter.format(new Date(date)) : "未定";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      [
        "id",
        "name",
        "description",
        "price_jpy",
        "weight_grams",
        "origin",
        "roast_level",
        "flavor_notes",
        "shop_comment",
        "stock_quantity",
        "sales_start_date",
        "sales_end_date",
        "image_url",
      ].join(", "),
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`商品詳細の取得に失敗しました: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const product = data as unknown as Product;
  const productName = product.name ?? "名称未設定の商品";
  const productPrice = product.price_jpy ?? 0;
  const productImageUrl =
    product.image_url ?? "https://picsum.photos/600/600?random=coffee-detail";
  const productStock = product.stock_quantity ?? 0;
  const isSoldOut = productStock <= 0;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/products"
          className="mb-8 inline-flex text-sm font-semibold text-amber-900 transition hover:text-amber-700"
        >
          商品一覧へ戻る
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-stone-100 shadow-sm">
            <Image
              src={productImageUrl}
              alt={product.name ?? "コーヒー豆の商品画像"}
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              priority
              className="object-cover"
            />
            {isSoldOut ? (
              <span className="absolute left-5 top-5 rounded-full bg-zinc-900/85 px-4 py-2 text-sm font-semibold text-white">
                在庫切れ
              </span>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
              COFFEE BEANS
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {productName}
            </h1>
            <p className="mt-4 text-2xl font-bold text-amber-900">
              {formatPrice(productPrice)}
              {product.weight_grams ? (
                <span className="ml-2 text-base font-medium text-stone-500">
                  / {product.weight_grams}g
                </span>
              ) : null}
            </p>

            <p className="mt-6 leading-8 text-stone-700">
              {product.description ?? "商品の説明はまだ登録されていません。"}
            </p>

            <dl className="mt-8 grid gap-4 rounded-3xl bg-stone-50 p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-stone-500">産地</dt>
                <dd className="mt-1 text-stone-900">{product.origin ?? "未設定"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-500">焙煎度</dt>
                <dd className="mt-1 text-stone-900">{product.roast_level ?? "未設定"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-stone-500">味わい</dt>
                <dd className="mt-1 text-stone-900">{product.flavor_notes ?? "未設定"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-500">在庫</dt>
                <dd className="mt-1 text-stone-900">
                  {isSoldOut ? "在庫切れ" : `${productStock}点`}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-500">販売期間</dt>
                <dd className="mt-1 text-stone-900">
                  {formatDate(product.sales_start_date)} - {formatDate(product.sales_end_date)}
                </dd>
              </div>
            </dl>

            {product.shop_comment ? (
              <section className="mt-8 rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <h2 className="text-sm font-bold text-amber-950">店主コメント</h2>
                <p className="mt-3 leading-7 text-amber-950">{product.shop_comment}</p>
              </section>
            ) : null}

            <AddToCartButton
              productId={product.id}
              name={productName}
              price={productPrice}
              imageUrl={productImageUrl}
              maxStock={productStock}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

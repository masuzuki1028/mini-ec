import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name_snapshot: string | null;
  unit_price_jpy_snapshot: number | null;
  quantity: number | null;
  subtotal_jpy: number | null;
  products: {
    name: string | null;
    image_url: string | null;
  } | null;
};

type OrderDetail = {
  id: string;
  status: string | null;
  total_amount_jpy: number | null;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_phone: string | null;
  created_at: string | null;
  ordered_at: string | null;
  order_items: OrderItem[];
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function formatPrice(price: number | null) {
  return `${(price ?? 0).toLocaleString("ja-JP")}円`;
}

function formatDate(date: string | null) {
  return date ? dateFormatter.format(new Date(date)) : "日時不明";
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "paid":
      return "支払い済み";
    case "pending":
      return "未決済";
    case "shipped":
      return "発送済み";
    case "cancelled":
      return "キャンセル";
    default:
      return status ?? "不明";
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/orders/${id}`);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        status,
        total_amount_jpy,
        shipping_name,
        shipping_address,
        shipping_phone,
        created_at,
        ordered_at,
        order_items (
          id,
          product_id,
          product_name_snapshot,
          unit_price_jpy_snapshot,
          quantity,
          subtotal_jpy,
          products (
            name,
            image_url
          )
        )
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`注文詳細の取得に失敗しました: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const order = data as unknown as OrderDetail;

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-950 sm:px-8 sm:py-14">
      <section className="mx-auto w-full max-w-5xl">
        <Link
          href="/orders"
          className="mb-8 inline-flex text-sm font-semibold text-amber-900 transition hover:text-amber-700"
        >
          注文履歴に戻る
        </Link>

        <div className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
                ORDER DETAIL
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                注文番号 #{order.id.slice(0, 8)}
              </h1>
              <p className="mt-3 text-sm text-stone-500">
                注文日時: {formatDate(order.created_at ?? order.ordered_at)}
              </p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">商品一覧</h2>
            <div className="mt-6 divide-y divide-stone-200">
              {order.order_items.map((item) => {
                const productName =
                  item.product_name_snapshot ?? item.products?.name ?? "商品名不明";
                const unitPrice = item.unit_price_jpy_snapshot ?? 0;
                const quantity = item.quantity ?? 0;
                const subtotal = item.subtotal_jpy ?? unitPrice * quantity;

                return (
                  <div
                    key={item.id}
                    className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[88px_1fr_auto] sm:items-center"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
                      <Image
                        src={
                          item.products?.image_url ??
                          "https://picsum.photos/600/600?random=order-item"
                        }
                        alt={productName}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{productName}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        単価: {formatPrice(unitPrice)} × {quantity}
                      </p>
                    </div>
                    <p className="font-bold text-amber-900">{formatPrice(subtotal)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">お届け先</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-stone-500">氏名</dt>
                  <dd className="mt-1 text-stone-900">{order.shipping_name ?? "未設定"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-500">住所</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-stone-900">
                    {order.shipping_address ?? "未設定"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-500">電話番号</dt>
                  <dd className="mt-1 text-stone-900">{order.shipping_phone ?? "未設定"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">合計金額</h2>
              <p className="mt-4 text-3xl font-bold text-amber-900">
                {formatPrice(order.total_amount_jpy)}
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

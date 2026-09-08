import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { createClient } from "@/lib/supabase/server";

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type AdminOrderItem = {
  id: string;
  product_name_snapshot: string | null;
  unit_price_jpy_snapshot: number | null;
  quantity: number | null;
  subtotal_jpy: number | null;
  products: {
    name: string | null;
    image_url: string | null;
  } | null;
};

type AdminOrderDetail = {
  id: string;
  status: string | null;
  total_amount_jpy: number | null;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_phone: string | null;
  created_at: string | null;
  ordered_at: string | null;
  users: {
    email: string | null;
    display_name: string | null;
  } | null;
  order_items: AdminOrderItem[];
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

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const supabase = await createClient();
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
        users!orders_user_id_public_users_fkey (
          email,
          display_name
        ),
        order_items (
          id,
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
    .maybeSingle();

  if (error) {
    throw new Error(`注文詳細の取得に失敗しました: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const order = data as unknown as AdminOrderDetail;
  const customerEmail = order.users?.email ?? order.users?.display_name ?? "不明";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex text-sm font-bold text-slate-500 transition hover:text-slate-950"
      >
        注文一覧に戻る
      </Link>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-slate-500">
              ORDER DETAIL
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              注文番号 #{order.id.slice(0, 8)}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              注文日時: {formatDate(order.created_at ?? order.ordered_at)}
            </p>
            <p className="mt-2 text-sm text-slate-500">注文者: {customerEmail}</p>
          </div>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">商品一覧</h3>
          <div className="mt-6 divide-y divide-slate-100">
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
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={
                        item.products?.image_url ??
                        "https://picsum.photos/600/600?random=admin-order-item"
                      }
                      alt={productName}
                      fill
                      sizes="88px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{productName}</p>
                    <p className="mt-1 text-sm text-slate-500">
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
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">お届け先</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">氏名</dt>
                <dd className="mt-1 text-slate-900">{order.shipping_name ?? "未設定"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">住所</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                  {order.shipping_address ?? "未設定"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">電話番号</dt>
                <dd className="mt-1 text-slate-900">{order.shipping_phone ?? "未設定"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">合計金額</h3>
            <p className="mt-4 text-3xl font-bold text-amber-900">
              {formatPrice(order.total_amount_jpy)}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

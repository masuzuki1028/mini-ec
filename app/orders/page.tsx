import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OrderSummary = {
  id: string;
  status: string | null;
  total_amount_jpy: number | null;
  created_at: string | null;
  ordered_at: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

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

export const metadata = {
  title: "注文履歴 | MAME COFFEE",
  description: "ログイン中のユーザーの注文履歴を表示します。",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_amount_jpy, created_at, ordered_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`注文履歴の取得に失敗しました: ${error.message}`);
  }

  const orders = (data ?? []) as unknown as OrderSummary[];

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-950 sm:px-8 sm:py-14">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
            ORDER HISTORY
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            注文履歴
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-stone-600">
            これまでに注文したコーヒー豆の履歴を確認できます。
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              ☕
            </div>
            <h2 className="text-xl font-semibold">まだ注文はありません。</h2>
            <Link
              href="/products"
              className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              お店トップへ
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-sm font-bold text-stone-900">
                      #{order.id.slice(0, 8)}
                    </p>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">
                    注文日時: {formatDate(order.created_at ?? order.ordered_at)}
                  </p>
                </div>
                <p className="text-xl font-bold text-amber-900">
                  {formatPrice(order.total_amount_jpy)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

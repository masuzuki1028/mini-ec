import Link from "next/link";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { createClient } from "@/lib/supabase/server";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    status?: string;
    email?: string;
  }>;
};

type AdminOrder = {
  id: string;
  status: string | null;
  total_amount_jpy: number | null;
  created_at: string | null;
  ordered_at: string | null;
  users: {
    email: string | null;
    display_name: string | null;
  } | null;
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const FILTER_STATUSES = ["all", "paid", "shipped", "completed"] as const;

function formatPrice(price: number | null) {
  return `${(price ?? 0).toLocaleString("ja-JP")}円`;
}

function formatDate(date: string | null) {
  return date ? dateFormatter.format(new Date(date)) : "日時不明";
}

function normalizeStatus(status: string | undefined) {
  return FILTER_STATUSES.includes(status as (typeof FILTER_STATUSES)[number])
    ? status
    : "all";
}

export const metadata = {
  title: "注文管理 | MAME COFFEE",
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status, email } = await searchParams;
  const selectedStatus = normalizeStatus(status);
  const emailKeyword = (email ?? "").trim().toLowerCase();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        status,
        total_amount_jpy,
        created_at,
        ordered_at,
        users!orders_user_id_public_users_fkey (
          email,
          display_name
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`注文一覧の取得に失敗しました: ${error.message}`);
  }

  const orders = ((data ?? []) as unknown as AdminOrder[]).filter((order) => {
    const orderEmail = (order.users?.email ?? order.users?.display_name ?? "").toLowerCase();
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchesEmail = !emailKeyword || orderEmail.includes(emailKeyword);

    return matchesStatus && matchesEmail;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">注文管理</h2>
        <p className="mt-3 text-slate-500">注文ステータスと注文者情報を確認します。</p>
      </div>

      <form
        method="get"
        className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[200px_1fr_auto]"
      >
        <label className="block">
          <span className="text-sm font-bold text-slate-700">ステータス</span>
          <select
            name="status"
            defaultValue={selectedStatus}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="all">すべて</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="completed">completed</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">注文者メール</span>
          <input
            name="email"
            defaultValue={email ?? ""}
            placeholder="customer@example.com"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 md:w-auto"
          >
            絞り込む
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-900 text-left text-white">
              <tr>
                <th className="px-5 py-4 font-bold">注文番号</th>
                <th className="px-5 py-4 font-bold">注文者メール</th>
                <th className="px-5 py-4 font-bold">合計金額</th>
                <th className="px-5 py-4 font-bold">ステータス</th>
                <th className="px-5 py-4 font-bold">注文日時</th>
                <th className="px-5 py-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-5 py-4 font-mono font-bold">#{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4">
                    {order.users?.email ?? order.users?.display_name ?? "不明"}
                  </td>
                  <td className="px-5 py-4 font-bold text-amber-900">
                    {formatPrice(order.total_amount_jpy)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-5 py-4">
                    {formatDate(order.created_at ?? order.ordered_at)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-500">
            条件に一致する注文はありません。
          </div>
        ) : null}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";

type CheckoutCompletePageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export const metadata = {
  title: "注文完了 | MAME COFFEE",
  description: "ご注文ありがとうございました。",
};

export default async function CheckoutCompletePage({
  searchParams,
}: CheckoutCompletePageProps) {
  const { orderId } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-stone-950">
      <ClearCartOnMount />
      <section className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ☕
        </div>
        <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
          ORDER COMPLETE
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          ご注文ありがとうございました
        </h1>
        <p className="mt-4 leading-7 text-stone-600">
          ご注文を受け付けました。焙煎したての豆を丁寧にお届けします。
        </p>

        <div className="mt-8 rounded-3xl bg-stone-50 p-5 text-left">
          <p className="text-sm font-semibold text-stone-500">注文番号</p>
          <p className="mt-2 break-all font-mono text-sm font-bold text-stone-900">
            {orderId ?? "不明"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
          >
            注文履歴を見る
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold transition hover:bg-stone-50"
          >
            商品一覧へ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}

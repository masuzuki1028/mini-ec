"use client";

import Link from "next/link";
import { createOrder } from "@/app/checkout/actions";
import { useCart } from "@/hooks/use-cart";

function formatPrice(price: number) {
  return `${price.toLocaleString("ja-JP")}円`;
}

export function CheckoutForm() {
  const { items, totalAmount } = useCart();
  const cartItemsValue = JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  );

  if (items.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ☕
        </div>
        <h2 className="text-xl font-semibold">カートは空です</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
          注文する商品をカートに追加してから決済へ進んでください。
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
        >
          お買い物を続ける
        </Link>
      </div>
    );
  }

  return (
    <form action={createOrder} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="cartItems" value={cartItemsValue} />

      <div className="space-y-8">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">注文内容</h2>
          <div className="mt-6 divide-y divide-stone-200">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-amber-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">お届け先</h2>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-stone-700">氏名</span>
              <input
                name="shippingName"
                required
                autoComplete="name"
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-800 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-700">住所</span>
              <textarea
                name="shippingAddress"
                required
                rows={4}
                autoComplete="street-address"
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-800 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-700">電話番号</span>
              <input
                name="shippingPhone"
                required
                type="tel"
                autoComplete="tel"
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-800 focus:bg-white"
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">お支払い</h2>
        <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-6">
          <span className="font-semibold text-stone-600">合計金額</span>
          <span className="text-2xl font-bold text-amber-900">
            {formatPrice(totalAmount)}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-stone-500">
          このチュートリアルでは決済処理は常に成功扱いで注文を作成します。
        </p>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-stone-950 px-6 py-4 text-base font-bold text-white transition hover:bg-stone-800"
        >
          注文する
        </button>
        <Link
          href="/cart"
          className="mt-3 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
        >
          カートへ戻る
        </Link>
      </aside>
    </form>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

function formatPrice(price: number) {
  return `${price.toLocaleString("ja-JP")}円`;
}

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

  async function handleCheckout() {
    setIsPreparingCheckout(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session.");
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error("Checkout session URL is missing.");
      }

      window.location.href = data.url;
    } catch {
      alert("決済の準備に失敗しました");
      setIsPreparingCheckout(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
            SHOPPING CART
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            カートに入っている商品
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              ☕
            </div>
            <h2 className="text-xl font-semibold">カートは空です</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
              気になるコーヒー豆を見つけたら、商品詳細ページからカートに追加できます。
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              お買い物を続ける
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-4">
              {items.map((item) => {
                const isMinQuantity = item.quantity <= 1;
                const isMaxQuantity = item.quantity >= item.maxStock;

                return (
                  <article
                    key={item.productId}
                    className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr] sm:p-5"
                  >
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="text-lg font-semibold tracking-tight text-stone-900 transition hover:text-amber-900"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-stone-500">
                          単価: {formatPrice(item.price)}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          小計: {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-full border border-stone-200 bg-stone-50">
                          <button
                            type="button"
                            disabled={isMinQuantity}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="size-10 rounded-full text-lg font-bold transition hover:bg-white disabled:cursor-not-allowed disabled:text-stone-300"
                            aria-label={`${item.name} の数量を減らす`}
                          >
                            -
                          </button>
                          <span className="min-w-10 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isMaxQuantity}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="size-10 rounded-full text-lg font-bold transition hover:bg-white disabled:cursor-not-allowed disabled:text-stone-300"
                            aria-label={`${item.name} の数量を増やす`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="rounded-full px-4 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">ご注文内容</h2>
              <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-6">
                <span className="font-semibold text-stone-600">合計金額</span>
                <span className="text-2xl font-bold text-amber-900">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <button
                type="button"
                disabled={isPreparingCheckout}
                onClick={handleCheckout}
                className="mt-6 flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-4 text-base font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
              >
                {isPreparingCheckout ? "処理中…" : "決済する"}
              </button>
              <Link
                href="/products"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-bold transition hover:bg-stone-50"
              >
                お買い物を続ける
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full rounded-full px-6 py-3 text-sm font-bold text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
              >
                カートを空にする
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

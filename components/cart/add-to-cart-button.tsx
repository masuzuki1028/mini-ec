"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  maxStock: number;
};

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  maxStock,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [wasAdded, setWasAdded] = useState(false);
  const isSoldOut = maxStock <= 0;

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => {
        addItem({
          productId,
          name,
          price,
          imageUrl,
          maxStock,
        });
        setWasAdded(true);
      }}
      className="mt-8 w-full rounded-full bg-stone-950 px-6 py-4 text-base font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
    >
      {isSoldOut ? "在庫切れ" : wasAdded ? "カートに追加しました" : "カートに追加"}
    </button>
  );
}

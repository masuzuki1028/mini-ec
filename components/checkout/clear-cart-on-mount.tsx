"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";

export function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      clearCart();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [clearCart]);

  return null;
}

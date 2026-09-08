"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CheckoutCartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseCartItems(value: string): CheckoutCartItem[] {
  try {
    const parsedValue = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((item) => ({
        productId: String(item.productId ?? ""),
        name: String(item.name ?? ""),
        price: Number(item.price),
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          item.productId &&
          item.name &&
          Number.isFinite(item.price) &&
          Number.isFinite(item.quantity) &&
          item.price >= 0 &&
          item.quantity >= 1,
      )
      .map((item) => ({
        ...item,
        price: Math.floor(item.price),
        quantity: Math.floor(item.quantity),
      }));
  } catch {
    return [];
  }
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirect=/checkout");
  }

  const shippingName = readText(formData, "shippingName");
  const shippingAddress = readText(formData, "shippingAddress");
  const shippingPhone = readText(formData, "shippingPhone");
  const cartItems = parseCartItems(readText(formData, "cartItems"));

  if (!shippingName || !shippingAddress || !shippingPhone || cartItems.length === 0) {
    redirect("/checkout");
  }

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // TODO: 次レッスンで Stripe に置き換え
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "paid",
      total_amount_jpy: totalAmount,
      shipping_name: shippingName,
      shipping_postal_code: null,
      shipping_address: shippingAddress,
      shipping_phone: shippingPhone,
      ordered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`注文の作成に失敗しました: ${orderError?.message ?? "unknown error"}`);
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name_snapshot: item.name,
    unit_price_jpy_snapshot: item.price,
    quantity: item.quantity,
    subtotal_jpy: item.price * item.quantity,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (orderItemsError) {
    throw new Error(`注文明細の作成に失敗しました: ${orderItemsError.message}`);
  }

  redirect(`/checkout/complete?orderId=${order.id}`);
}

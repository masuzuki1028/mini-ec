"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

const ORDER_STATUSES = ["pending", "paid", "shipped", "completed"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin("/admin/orders");

  if (!isOrderStatus(status)) {
    return {
      error: "不正なステータスです。",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return {
      error: `ステータスの更新に失敗しました: ${error.message}`,
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return {
    success: true,
  };
}

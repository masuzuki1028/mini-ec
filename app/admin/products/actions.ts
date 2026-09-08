"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readInteger(formData: FormData, key: string) {
  const value = Number(readText(formData, key));
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function readProductForm(formData: FormData) {
  return {
    name: readText(formData, "name"),
    price_jpy: readInteger(formData, "price_jpy"),
    image_url: readText(formData, "image_url") || null,
    description: readText(formData, "description") || null,
    stock_quantity: readInteger(formData, "stock_quantity"),
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin("/admin/products/new");
  const product = readProductForm(formData);

  if (!product.name || product.price_jpy <= 0) {
    redirect("/admin/products/new");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(product);

  if (error) {
    throw new Error(`商品の作成に失敗しました: ${error.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin(`/admin/products/${productId}/edit`);
  const product = readProductForm(formData);

  if (!product.name || product.price_jpy <= 0) {
    redirect(`/admin/products/${productId}/edit`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("id", productId);

  if (error) {
    throw new Error(`商品の更新に失敗しました: ${error.message}`);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin("/admin/products");
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "すでに注文がある商品は削除できません。",
      };
    }

    return {
      error: `商品の削除に失敗しました: ${error.message}`,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return {
    success: true,
  };
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AdminUser = {
  id: string;
  email: string | undefined;
};

export async function requireAdmin(redirectPath = "/admin"): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`管理者権限の確認に失敗しました: ${error.message}`);
  }

  const role = (profile as { role?: string } | null)?.role;

  if (role !== "admin") {
    redirect("/auth/unauthorized");
  }

  return {
    id: user.id,
    email: user.email,
  };
}

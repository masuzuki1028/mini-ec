"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const router = useRouter();
  const { totalQuantity } = useCart();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUserEmail(data.user?.email ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/products" className="text-lg font-bold tracking-[0.2em]">
          MAME COFFEE
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-stone-600">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-stone-100 hover:text-stone-950"
            aria-label={`カートを見る。現在 ${totalQuantity} 個の商品があります`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M6 6h15l-1.5 8h-12z" />
              <path d="M6 6 5.5 3H3" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span>カート</span>
            <span className="min-w-5 rounded-full bg-amber-800 px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
              {totalQuantity}
            </span>
          </Link>
          {userEmail ? (
            <div className="flex items-center gap-3">
              <Link href="/orders" className="transition hover:text-stone-950">
                注文履歴
              </Link>
              <span className="hidden max-w-48 truncate text-stone-500 sm:inline">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-stone-200 px-3 py-2 transition hover:bg-stone-100 hover:text-stone-950"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="transition hover:text-stone-950">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-stone-950 px-3 py-2 text-white transition hover:bg-stone-800"
              >
                新規登録
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

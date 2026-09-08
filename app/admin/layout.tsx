import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminUser = await requireAdmin("/admin");

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold tracking-[0.25em] text-slate-500">
                ADMIN
              </p>
              <h1 className="text-2xl font-bold tracking-tight">管理画面</h1>
              <p className="mt-2 text-sm text-slate-500">
                {adminUser.email ?? "admin"} としてログイン中
              </p>
            </div>
            <nav className="flex flex-wrap gap-3 text-sm font-bold">
              <Link
                href="/admin/products"
                className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                商品管理
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                注文管理
              </Link>
            </nav>
          </div>
        </div>

        {children}
      </section>
    </main>
  );
}

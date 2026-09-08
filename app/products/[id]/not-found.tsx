import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 text-stone-950">
      <section className="w-full max-w-lg rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ☕
        </div>
        <h1 className="text-2xl font-bold">商品が見つかりませんでした</h1>
        <p className="mt-4 leading-7 text-stone-600">
          商品が削除されたか、現在は公開されていない可能性があります。
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
        >
          商品一覧へ戻る
        </Link>
      </section>
    </main>
  );
}

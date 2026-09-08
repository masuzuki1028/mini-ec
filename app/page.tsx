import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-12 text-stone-950 sm:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-start justify-center rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
          MAME COFFEE
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          自家焙煎のコーヒー豆を、少しずつ丁寧に。
        </h1>
        <p className="mt-6 max-w-2xl leading-8 text-stone-600">
          季節ごとに選んだ豆を、月替わりで販売する小さなオンライン店舗です。
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
          >
            商品を見る
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold transition hover:bg-stone-50"
          >
            注文履歴を見る
          </Link>
        </div>
      </section>
    </main>
  );
}

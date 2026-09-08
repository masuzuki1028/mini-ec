const skeletonItems = Array.from({ length: 6 }, (_, index) => `product-skeleton-${index}`);

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 max-w-2xl space-y-4">
          <div className="h-4 w-36 rounded bg-amber-100" />
          <div className="h-10 w-72 rounded bg-stone-200" />
          <div className="h-5 w-full max-w-xl rounded bg-stone-200" />
          <div className="h-5 w-4/5 max-w-lg rounded bg-stone-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {skeletonItems.map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="aspect-square animate-pulse bg-stone-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-4/5 animate-pulse rounded bg-stone-200" />
                <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

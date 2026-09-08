import Image from "next/image";
import Link from "next/link";

export type ProductCardProduct = {
  id: string;
  name: string | null;
  price_jpy: number | null;
  stock_quantity: number | null;
  image_url: string | null;
};

type ProductCardProps = {
  product: ProductCardProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.stock_quantity === 0;
  const price = `${(product.price_jpy ?? 0).toLocaleString("ja-JP")}円`;

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group block overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        isSoldOut ? "opacity-60 grayscale" : ""
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Image
          src={product.image_url ?? "https://picsum.photos/600/600?random=coffee"}
          alt={product.name ?? "コーヒー豆の商品画像"}
          fill
          sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {isSoldOut ? (
          <span className="absolute left-4 top-4 rounded-full bg-zinc-900/85 px-3 py-1 text-sm font-semibold text-white">
            在庫切れ
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-5">
        <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-stone-900">
          {product.name}
        </h2>
        <p className="text-base font-bold text-amber-900">{price}</p>
      </div>
    </Link>
  );
}

type ProductFormInitialValue = {
  name?: string | null;
  price_jpy?: number | null;
  image_url?: string | null;
  description?: string | null;
  stock_quantity?: number | null;
};

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialValue?: ProductFormInitialValue;
};

export function ProductForm({
  action,
  submitLabel,
  initialValue,
}: ProductFormProps) {
  return (
    <form
      action={action}
      className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">商品名</span>
          <input
            name="name"
            required
            defaultValue={initialValue?.name ?? ""}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">価格</span>
          <input
            name="price_jpy"
            required
            type="number"
            min="1"
            defaultValue={initialValue?.price_jpy ?? ""}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">画像URL</span>
          <input
            name="image_url"
            type="url"
            defaultValue={initialValue?.image_url ?? ""}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">在庫数</span>
          <input
            name="stock_quantity"
            required
            type="number"
            min="0"
            defaultValue={initialValue?.stock_quantity ?? 0}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-bold text-slate-700">説明</span>
          <textarea
            name="description"
            rows={5}
            defaultValue={initialValue?.description ?? ""}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

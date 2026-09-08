"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct } from "@/app/admin/products/actions";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(`「${productName}」を削除しますか？`);
    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result?.error) {
        setErrorMessage(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="rounded-full px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        {isPending ? "削除中..." : "削除"}
      </button>
      {errorMessage ? (
        <p className="max-w-48 text-xs font-medium leading-5 text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, type OrderStatus } from "@/app/admin/orders/actions";

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "completed"];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-700",
};

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string | null;
};

function normalizeStatus(status: string | null): OrderStatus {
  return ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "pending";
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    normalizeStatus(currentStatus),
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: string) {
    const previousStatus = selectedStatus;
    const normalizedStatus = normalizeStatus(nextStatus);
    setSelectedStatus(normalizedStatus);
    setMessage("");
    setErrorMessage("");

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, normalizedStatus);

      if (result?.error) {
        setSelectedStatus(previousStatus);
        setErrorMessage(result.error);
        return;
      }

      setMessage("ステータスを更新しました");
      window.setTimeout(() => setMessage(""), 2500);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[selectedStatus]}`}
        >
          {selectedStatus}
        </span>
        <select
          value={selectedStatus}
          disabled={isPending}
          onChange={(event) => handleChange(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {message ? (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

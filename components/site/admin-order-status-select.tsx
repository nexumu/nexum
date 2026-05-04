"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

type AdminOrderStatusSelectProps = {
  orderId: string;
  status: OrderStatus;
};

export function AdminOrderStatusSelect({
  orderId,
  status,
}: AdminOrderStatusSelectProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextStatus: OrderStatus) => {
    setCurrentStatus(nextStatus);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            status: nextStatus,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          setCurrentStatus(status);
          setError(payload.error ?? "No se pudo actualizar el estado.");
          return;
        }

        router.refresh();
      } catch (submitError) {
        console.error(submitError);
        setCurrentStatus(status);
        setError("No se pudo actualizar el estado.");
      }
    });
  };

  return (
    <div className="grid gap-1">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      >
        {ORDER_STATUSES.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {statusOption}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

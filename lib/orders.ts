import type { CartItem } from "@/lib/cart";

export type OrderProduct = {
  id: string;
  name: string;
  price: number;
  amount: number;
  size: string;
  optionType?: CartItem["optionType"];
  optionValue?: string;
};

export const ORDER_STATUSES = [
  "pendiente",
  "aceptado",
  "en camino",
  "entregado",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  customerName: string;
  address: string;
  whatsapp: string;
  shippingCost: number;
  status: OrderStatus;
  items: OrderProduct[];
  subtotal: number;
  total: number;
  source: "manual" | "checkout";
  createdAt?: Date;
};

export function normalizeOrderItems(items: unknown): OrderProduct[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized: OrderProduct[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const source = item as Partial<OrderProduct>;
    const id = String(source.id ?? "").trim();
    const name = String(source.name ?? "").trim();
    const size = String(source.size ?? "").trim();
    const optionValue = String(source.optionValue ?? "").trim();
    const price = Number(source.price ?? 0);
    const amount = Math.max(1, Math.floor(Number(source.amount ?? 1)));

    if (!id || !name || !Number.isFinite(price) || price < 0) {
      continue;
    }

    const optionType =
      source.optionType === "talle" ||
      source.optionType === "color" ||
      source.optionType === "tamano" ||
      source.optionType === "material" ||
      source.optionType === "otro"
        ? source.optionType
        : undefined;

    normalized.push({
      id,
      name,
      size,
      optionType,
      optionValue: optionValue || size,
      price,
      amount,
    });
  }

  return normalized;
}

export function calculateOrderSubtotal(items: OrderProduct[]) {
  return items.reduce((total, item) => total + item.price * item.amount, 0);
}

export function normalizeOrderStatus(value: unknown): OrderStatus {
  const status = String(value ?? "").trim().toLowerCase();
  return ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "pendiente";
}

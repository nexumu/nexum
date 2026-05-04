import {
  addDoc,
  collection,
  getDocs,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/server";
import {
  calculateOrderSubtotal,
  normalizeOrderStatus,
  normalizeOrderItems,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

const ordersCollection = collection(db, "orders");

function mapOrderData(id: string, data: Record<string, unknown>): Order {
  const items = normalizeOrderItems(data.items);
  const subtotal = calculateOrderSubtotal(items);
  const shippingCost = Number(data.shippingCost ?? 0);
  const total = Number.isFinite(Number(data.total))
    ? Number(data.total)
    : subtotal + (Number.isFinite(shippingCost) ? shippingCost : 0);

  const status = normalizeOrderStatus(data.status);

  const sourceRaw = String(data.source ?? "checkout");
  const source = sourceRaw === "manual" ? "manual" : "checkout";

  const createdAtRaw = data.createdAt;
  const createdAt =
    createdAtRaw instanceof Timestamp
      ? createdAtRaw.toDate()
      : createdAtRaw instanceof Date
      ? createdAtRaw
      : undefined;

  return {
    id,
    customerName: String(data.customerName ?? "Sin nombre"),
    address: String(data.address ?? "Sin direccion"),
    whatsapp: String(data.whatsapp ?? ""),
    shippingCost: Number.isFinite(shippingCost) ? shippingCost : 0,
    subtotal,
    total,
    status,
    source,
    items,
    createdAt,
  };
}

export type CreateOrderInput = {
  customerName: string;
  address: string;
  whatsapp: string;
  shippingCost?: number;
  items: unknown;
  source?: "manual" | "checkout";
};

export async function createOrder(input: CreateOrderInput) {
  const items = normalizeOrderItems(input.items);
  const subtotal = calculateOrderSubtotal(items);
  const shippingCost = Number(input.shippingCost ?? 0);
  const normalizedShippingCost =
    Number.isFinite(shippingCost) && shippingCost >= 0 ? shippingCost : 0;

  const payload = {
    customerName: input.customerName.trim(),
    address: input.address.trim(),
    whatsapp: input.whatsapp.trim(),
    shippingCost: normalizedShippingCost,
    subtotal,
    total: subtotal + normalizedShippingCost,
    status: "pendiente" as const,
    source: input.source === "manual" ? "manual" : "checkout",
    items,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersCollection, payload);
  return { id: docRef.id, ...payload };
}

export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(
    query(ordersCollection, orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((docSnap) =>
    mapOrderData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orderRef = doc(ordersCollection, orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  return { id: orderId, status };
}

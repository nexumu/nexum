export type CartItem = {
  id: string;
  name: string;
  price: number;
  amount: number;
  size: string;
};

const CART_STORAGE_KEY = "epicom-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        price: Number(item.price),
        amount: Math.max(1, Number(item.amount) || 1),
        size: String(item.size ?? ""),
      }));
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(nextItem: CartItem): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const items = readCart();
  const index = items.findIndex(
    (item) => item.id === nextItem.id && item.size === nextItem.size
  );

  if (index >= 0) {
    const current = items[index];
    items[index] = {
      ...current,
      amount: current.amount + Math.max(1, nextItem.amount),
      price: Number.isFinite(nextItem.price) ? nextItem.price : current.price,
      name: nextItem.name || current.name,
      size: nextItem.size || current.size,
    };
  } else {
    items.push({
      ...nextItem,
      amount: Math.max(1, nextItem.amount),
    });
  }

  writeCart(items);
  return items;
}

export function setCartItemAmount(id: string, size: string, amount: number) {
  if (typeof window === "undefined") {
    return [];
  }

  const items = readCart();
  const index = items.findIndex((item) => item.id === id && item.size === size);
  if (index === -1) {
    return items;
  }

  if (amount <= 0) {
    items.splice(index, 1);
  } else {
    items[index] = {
      ...items[index],
      amount,
    };
  }

  writeCart(items);
  return items;
}

export function removeFromCart(id: string, size: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const items = readCart().filter(
    (item) => !(item.id === id && item.size === size)
  );
  writeCart(items);
  return items;
}

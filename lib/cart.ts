export type CartItem = {
  id: string;
  name: string;
  price: number;
  amount: number;
  size: string;
  optionType?: "talle" | "color" | "tamano" | "material" | "otro";
  optionValue?: string;
};

const CART_STORAGE_KEY = "epicom-cart";

const VALID_OPTION_TYPES: CartItem["optionType"][] = [
  "talle",
  "color",
  "tamano",
  "material",
  "otro",
];

function toText(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
}

function toPrice(value: unknown, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function toAmount(value: unknown, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.floor(parsed));
}

function parseOptionType(value: unknown): CartItem["optionType"] {
  return VALID_OPTION_TYPES.includes(value as CartItem["optionType"])
    ? (value as CartItem["optionType"])
    : undefined;
}

function normalizeCartItem(item: unknown): CartItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const source = item as Partial<CartItem>;
  const id = toText(source.id);
  if (!id) {
    return null;
  }

  const size = toText(source.size);
  const optionType = parseOptionType(source.optionType);
  const optionValue = toText(source.optionValue) || size;

  return {
    id,
    name: toText(source.name, "Producto"),
    price: toPrice(source.price),
    amount: toAmount(source.amount),
    size,
    optionType,
    optionValue,
  };
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function getItemOptionKey(item: Pick<CartItem, "optionType" | "optionValue" | "size">) {
  const optionType = item.optionType ?? "talle";
  const optionValue = toText(item.optionValue ?? item.size ?? "");
  return `${optionType}:${optionValue}`;
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

  const normalizedNextItem = normalizeCartItem(nextItem);
  if (!normalizedNextItem) {
    return readCart();
  }

  const items = readCart();
  const index = items.findIndex(
    (item) =>
      item.id === normalizedNextItem.id &&
      getItemOptionKey(item) === getItemOptionKey(normalizedNextItem)
  );

  if (index >= 0) {
    const current = items[index];
    items[index] = {
      ...current,
      amount: current.amount + normalizedNextItem.amount,
      price: normalizedNextItem.price,
      name: normalizedNextItem.name || current.name,
      size: normalizedNextItem.size || current.size,
      optionType: normalizedNextItem.optionType ?? current.optionType,
      optionValue: normalizedNextItem.optionValue || current.optionValue,
    };
  } else {
    items.push(normalizedNextItem);
  }

  writeCart(items);
  return items;
}

export function setCartItemAmount(
  id: string,
  size: string,
  amount: number,
  optionType?: CartItem["optionType"],
  optionValue?: string
) {
  if (typeof window === "undefined") {
    return [];
  }

  const items = readCart();
  const selectorType = optionType ?? "talle";
  const selectorValue = optionValue ?? size;
  const normalizedAmount = Number.isFinite(amount)
    ? Math.floor(amount)
    : 0;
  const index = items.findIndex(
    (item) =>
      item.id === id &&
      getItemOptionKey(item) === `${selectorType}:${selectorValue}`
  );
  if (index === -1) {
    return items;
  }

  if (normalizedAmount <= 0) {
    items.splice(index, 1);
  } else {
    items[index] = {
      ...items[index],
      amount: Math.max(1, normalizedAmount),
    };
  }

  writeCart(items);
  return items;
}

export function removeFromCart(
  id: string,
  size: string,
  optionType?: CartItem["optionType"],
  optionValue?: string
) {
  if (typeof window === "undefined") {
    return [];
  }

  const selectorType = optionType ?? "talle";
  const selectorValue = optionValue ?? size;
  const items = readCart().filter(
    (item) => !(item.id === id && getItemOptionKey(item) === `${selectorType}:${selectorValue}`)
  );
  writeCart(items);
  return items;
}

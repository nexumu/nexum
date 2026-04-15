import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
  endAt,
  type QueryConstraint,
} from "firebase/firestore";

import { type ProductCardData } from "@/components/site/product-card";
import { db } from "@/lib/firebase/server";

const productsCollection = collection(db, "products");
const fallbackImage = "/products/product-1.svg";

function mapProductData(
  id: string,
  data: Record<string, unknown>
): ProductCardData {
  const rawImages = Array.isArray(data.images)
    ? data.images.filter((image): image is string => typeof image === "string")
    : [];
  const primaryImage =
    typeof data.image === "string" && data.image
      ? data.image
      : rawImages[0] ?? fallbackImage;

  const rawVariantType = data.variantType;
  const variantType =
    rawVariantType === "talle" ||
    rawVariantType === "color" ||
    rawVariantType === "tamano" ||
    rawVariantType === "material" ||
    rawVariantType === "otro"
      ? rawVariantType
      : undefined;

  const variants = Array.isArray(data.variants)
    ? data.variants
        .map((variant, index) => {
          if (!variant || typeof variant !== "object") {
            return null;
          }

          const source = variant as Record<string, unknown>;
          const value = String(source.value ?? "").trim();
          const price = Number(source.price);
          const discountRaw = source.discountPercent;
          const discountNumber =
            discountRaw === undefined || discountRaw === null || discountRaw === ""
              ? undefined
              : Number(discountRaw);

          if (!value || Number.isNaN(price)) {
            return null;
          }

          return {
            id: String(source.id ?? `${id}-variant-${index}`),
            value,
            price,
            ...(discountNumber !== undefined && !Number.isNaN(discountNumber)
              ? { discountPercent: discountNumber }
              : {}),
          };
        })
        .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant))
    : undefined;

  return {
    id: String(data.id ?? id),
    name: String(data.name ?? "Producto"),
    description: String(data.description ?? ""),
    image: primaryImage,
    images: rawImages.length > 0 ? rawImages : [primaryImage],
    price: Number(data.price ?? 0),
    discountPercent:
      typeof data.discountPercent === "number"
        ? data.discountPercent
        : data.discountPercent
        ? Number(data.discountPercent)
        : undefined,
    isNew: Boolean(data.isNew),
    isFeatured: Boolean(data.isFeatured),
    variantType,
    variants,
  };
}

export async function getAllProducts(): Promise<ProductCardData[]> {
  const snapshot = await getDocs(query(productsCollection, orderBy("createdAt", "desc")));
  return snapshot.docs.map((docSnap) =>
    mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function getNewProducts(limitCount = 8): Promise<ProductCardData[]> {
  const snapshot = await getDocs(
    query(
      productsCollection,
      where("isNew", "==", true),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
  );
  return snapshot.docs.map((docSnap) =>
    mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function getFeaturedProducts(
  limitCount = 8
): Promise<ProductCardData[]> {
  const snapshot = await getDocs(
    query(
      productsCollection,
      where("isFeatured", "==", true),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )
  );
  return snapshot.docs.map((docSnap) =>
    mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function getCollectionProducts(
  limitCount = 6
): Promise<ProductCardData[]> {
  const snapshot = await getDocs(
    query(productsCollection, orderBy("createdAt", "desc"), limit(limitCount))
  );
  return snapshot.docs.map((docSnap) =>
    mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function getSaleProducts(limitCount = 8): Promise<ProductCardData[]> {
  const snapshot = await getDocs(
    query(
      productsCollection,
      where("discountPercent", ">", 0),
      orderBy("discountPercent", "desc"),
      limit(limitCount)
    )
  );
  return snapshot.docs.map((docSnap) =>
    mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function getProductById(id: string): Promise<ProductCardData | null> {
  const docSnap = await getDoc(doc(productsCollection, id));
  if (!docSnap.exists()) return null;
  return mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>);
}

type ProductFilters = {
  queryText?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  categoryName?: string;
  subcategoryName?: string;
  limitCount?: number;
};

export async function getFilteredProducts({
  queryText,
  isNew,
  isFeatured,
  categoryName,
  subcategoryName,
  limitCount = 24,
}: ProductFilters): Promise<ProductCardData[]> {
  const normalizedQuery = queryText?.trim().toLowerCase();
  const constraints: QueryConstraint[] = [];

  if (isNew) {
    constraints.push(where("isNew", "==", true));
  }
  if (isFeatured) {
    constraints.push(where("isFeatured", "==", true));
  }
  if (categoryName) {
    constraints.push(where("categoryName", "==", categoryName));
  }
  if (subcategoryName) {
    constraints.push(where("subcategoryName", "==", subcategoryName));
  }

  if (normalizedQuery) {
    constraints.push(orderBy("nameLower"));
    constraints.push(startAt(normalizedQuery));
    constraints.push(endAt(`${normalizedQuery}\uf8ff`));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  constraints.push(limit(limitCount));

  const snapshot = await getDocs(query(productsCollection, ...constraints));
  return snapshot.docs.map((docSnap) =>
    mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
}

export async function getSimilarProducts(
  excludeId: string,
  limitCount = 6
): Promise<ProductCardData[]> {
  const snapshot = await getDocs(
    query(productsCollection, orderBy("createdAt", "desc"), limit(limitCount + 2))
  );
  return snapshot.docs
    .map((docSnap) =>
      mapProductData(docSnap.id, docSnap.data() as Record<string, unknown>)
    )
    .filter((product) => product.id !== excludeId)
    .slice(0, limitCount);
}

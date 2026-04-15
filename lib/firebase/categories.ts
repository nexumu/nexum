import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase/server";

export type CategoryOption = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

const categoriesCollection = collection(db, "categories");

export async function getCategories(): Promise<CategoryOption[]> {
  const snapshot = await getDocs(
    query(categoriesCollection, orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as {
      name?: string;
      subcategories?: { id: string; name: string }[];
    };
    return {
      id: docSnap.id,
      name: data.name ?? "Sin nombre",
      subcategories: data.subcategories ?? [],
    };
  });
}

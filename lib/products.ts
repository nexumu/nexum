import { type ProductCardData } from "@/components/site/product-card";

export const products: ProductCardData[] = [
  {
    id: "nocturne-blazer",
    name: "Nocturne Blazer",
    description:
      "Lightweight blazer with a relaxed silhouette and premium finishing details for daily wear.",
    image: "/products/product-1.svg",
    price: 129,
    discountPercent: 15,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "coastline-shirt",
    name: "Coastline Shirt",
    description:
      "Soft cotton shirt with a matte texture and natural drape for all-day comfort.",
    image: "/products/product-2.svg",
    price: 72,
    isNew: true,
  },
  {
    id: "district-knit",
    name: "District Knit",
    description:
      "Breathable knit with a structured collar made for urban layered outfits.",
    image: "/products/product-3.svg",
    price: 94,
    isFeatured: true,
  },
  {
    id: "studio-trouser",
    name: "Studio Trouser",
    description:
      "Straight trouser with technical stretch to improve comfort and durability.",
    image: "/products/product-4.svg",
    price: 88,
    discountPercent: 20,
  },
  {
    id: "rally-jacket",
    name: "Rally Jacket",
    description:
      "Transitional jacket with utility pockets and weather-ready finishing.",
    image: "/products/product-5.svg",
    price: 148,
    isNew: true,
  },
  {
    id: "terra-hoodie",
    name: "Terra Hoodie",
    description:
      "Compact fleece hoodie with brushed lining and a modern oversized fit.",
    image: "/products/product-6.svg",
    price: 68,
    discountPercent: 10,
    isFeatured: true,
  },
  {
    id: "sierra-vest",
    name: "Sierra Vest",
    description: "Light padded vest for easy layering during colder days.",
    image: "/products/product-7.svg",
    price: 110,
  },
  {
    id: "tempo-sneaker",
    name: "Tempo Sneaker",
    description:
      "Sneaker with a flexible sole and reinforced textile upper for active use.",
    image: "/products/product-8.svg",
    price: 120,
    discountPercent: 25,
    isFeatured: true,
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

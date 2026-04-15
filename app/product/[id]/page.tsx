import { notFound } from "next/navigation";

import { Navbar } from "@/components/site/navbar";
import { ProductShowcaseSection } from "@/components/site/product-showcase-section";
import { getProductById, getSimilarProducts } from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(product.id, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <ProductShowcaseSection
          product={product}
          similarProducts={similarProducts}
        />
      </main>
    </div>
  );
}

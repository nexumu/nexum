import { notFound } from "next/navigation";

import { Navbar } from "@/components/site/navbar";
import { ProductShowcaseSection } from "@/components/site/product-showcase-section";
import { getCatalogInfo } from "@/lib/catalog";
import { getProductById, getSimilarProducts } from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

export default async function CompanyProductPage({
  params,
}: {
  params: Promise<{ company: string; id: string }>;
}) {
  const { company: companyRaw, id } = await params;
  const company = companyRaw.trim().toLowerCase();
  const catalog = await getCatalogInfo(company);
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(product.id, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar company={company} catalog={catalog} />
      <main className="pb-20">
        <ProductShowcaseSection
          product={product}
          similarProducts={similarProducts}
          company={company}
        />
      </main>
    </div>
  );
}

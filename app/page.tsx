import { HeroCarousel } from "@/components/site/hero-carousel";
import { Navbar } from "@/components/site/navbar";
import { FaqSection } from "@/components/site/faq-section";
import { ProductCarouselSection } from "@/components/site/product-carousel-section";
import { Footer } from "@/components/site/footer";
import {
  getCollectionProducts,
  getFeaturedProducts,
  getNewProducts,
  getSaleProducts,
} from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivals, featuredProducts, collections, saleProducts] =
    await Promise.all([
      getNewProducts(8),
      getFeaturedProducts(8),
      getCollectionProducts(6),
      getSaleProducts(8),
    ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <HeroCarousel />

        <ProductCarouselSection
          id="new"
          eyebrow="Template Section"
          title="New Arrivals"
          description="Recently added products for current drops and seasons."
          products={newArrivals}
        />
        <ProductCarouselSection
          id="featured"
          eyebrow="Template Section"
          title="Featured Products"
          description="Highlighted picks for home page and campaign placements."
          products={featuredProducts}
        />
        <ProductCarouselSection
          id="collections"
          eyebrow="Template Section"
          title="Collections"
          description="Reusable block to group products by collection."
          products={collections}
        />
        <ProductCarouselSection
          id="sale"
          eyebrow="Template Section"
          title="Sale & Promotions"
          description="Discounted products for limited-time offers."
          products={saleProducts}
        />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

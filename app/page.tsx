import { HeroCarousel } from "@/components/site/hero-carousel";
import { Navbar } from "@/components/site/navbar";
import { FaqSection } from "@/components/site/faq-section";
import { ProductCarouselSection } from "@/components/site/product-carousel-section";
import { Footer } from "@/components/site/footer";
import { WordCarouselStrip } from "@/components/site/word-carousel-strip";
import {
  getFeaturedProducts,
  getNewProducts,
} from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivals, featuredProducts] = await Promise.all([
    getNewProducts(8),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <HeroCarousel />
        <WordCarouselStrip />

        <ProductCarouselSection
          id="new"
          eyebrow="Novedades"
          title="Recien llegados para tu hogar"
          description="Piezas nuevas para sumar calidez y practicidad a cada momento del dia."
          products={newArrivals}
        />
        <ProductCarouselSection
          id="featured"
          eyebrow="Seleccion Nexum"
          title="Favoritos de la semana"
          description="Una curaduria de vasos, termitos y accesorios para regalar o renovar tus espacios."
          products={featuredProducts}
        />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

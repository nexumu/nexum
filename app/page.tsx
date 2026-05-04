import { HeroCarousel } from "@/components/site/hero-carousel";
import { Navbar } from "@/components/site/navbar";
import { FaqSection } from "@/components/site/faq-section";
import { ProductCarouselSection } from "@/components/site/product-carousel-section";
import { CollectionHighlightSection } from "@/components/site/collection-highlight-section";
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

        <CollectionHighlightSection
          id="collars"
          eyebrow="Coleccion mascotas"
          title="Collares para perros con estilo y resistencia"
          description="Disenados para el paseo diario, con materiales comodos y terminaciones pensadas para durar."
          image="/collar.jpg"
          href="/search?category=Mascotas"
        />

        <ProductCarouselSection
          id="featured"
          eyebrow="Seleccion Nexum"
          title="Favoritos de la semana"
          description="Una curaduria de vasos, termitos y accesorios para regalar o renovar tus espacios."
          products={featuredProducts}
        />

        <CollectionHighlightSection
          id="drinkware"
          eyebrow="Coleccion termica"
          title="Termos para acompanarte todo el dia"
          description="Modelos termicos para oficina, viajes o entrenamientos. Conserva la temperatura y suma diseno."
          image="/termos.jpg"
          href="/search?category=Termos"
          align="right"
        />

        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
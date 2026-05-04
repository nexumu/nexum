import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { CollectionHighlightSection } from "@/components/site/collection-highlight-section";
import { FaqSection } from "@/components/site/faq-section";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { ProductCarouselSection } from "@/components/site/product-carousel-section";
import { WordCarouselStrip } from "@/components/site/word-carousel-strip";
import { getFeaturedProducts, getNewProducts } from "@/lib/firebase/products";
import { getCatalogInfo } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CompanyHomePage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companyRaw } = await params;
  const company = companyRaw.trim().toLowerCase();

  const [newArrivals, featuredProducts, catalog] = await Promise.all([
    getNewProducts(8),
    getFeaturedProducts(8),
    getCatalogInfo(company),
  ]);

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        ["--primary" as string]: catalog.primaryColor,
        ["--ring" as string]: catalog.primaryColor,
      }}
    >
      <Navbar company={company} catalog={catalog} />
      <main className="pb-20">
        <HeroCarousel company={company} />
        <WordCarouselStrip />

        <ProductCarouselSection
          id="new"
          eyebrow="Novedades"
          title="Recien llegados para tu hogar"
          description="Piezas nuevas para sumar calidez y practicidad a cada momento del dia."
          products={newArrivals}
          company={company}
        />

        <CollectionHighlightSection
          id="collars"
          eyebrow="Coleccion mascotas"
          title="Collares para perros con estilo y resistencia"
          description="Disenados para el paseo diario, con materiales comodos y terminaciones pensadas para durar."
          image="/collar.jpg"
          href={`/${company}/search?category=Mascotas`}
        />

        <ProductCarouselSection
          id="featured"
          eyebrow="Seleccion Nexum"
          title="Favoritos de la semana"
          description="Una curaduria de vasos, termitos y accesorios para regalar o renovar tus espacios."
          products={featuredProducts}
          company={company}
        />

        <CollectionHighlightSection
          id="drinkware"
          eyebrow="Coleccion termica"
          title="Termos para acompanarte todo el dia"
          description="Modelos termicos para oficina, viajes o entrenamientos. Conserva la temperatura y suma diseno."
          image="/termos.jpg"
          href={`/${company}/search?category=Termos`}
          align="right"
        />

        <FaqSection />
      </main>
      <Footer company={company} catalog={catalog} />
    </div>
  );
}

"use client";

import { ProductCard, type ProductCardData } from "@/components/site/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ProductCarouselSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  products: ProductCardData[];
  company?: string;
};

export function ProductCarouselSection({
  id,
  eyebrow,
  title,
  description,
  products,
  company,
}: ProductCarouselSectionProps) {
  return (
    <section id={id} className="mt-16 w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2">
        {eyebrow && (
          <p className="text-sm font-medium tracking-[0.22em] uppercase text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <Carousel
        opts={{
          align: "start",
          containScroll: "trimSnaps",
        }}
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard {...product} company={company} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 bg-background sm:-left-4" />
        <CarouselNext className="-right-3 bg-background sm:-right-4" />
      </Carousel>
    </section>
  );
}

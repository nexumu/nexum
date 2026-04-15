"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { ProductCarouselSection } from "@/components/site/product-carousel-section";
import { type ProductCardData } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { addToCart } from "@/lib/cart";

type ProductShowcaseSectionProps = {
  product: ProductCardData;
  similarProducts: ProductCardData[];
};

const sizes = ["XS", "S", "M", "L", "XL"];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductShowcaseSection({
  product,
  similarProducts,
}: ProductShowcaseSectionProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const imageUrls = useMemo(() => {
    const uniqueImages = Array.isArray(product.images)
      ? product.images.filter(
          (image, index, images) => Boolean(image) && images.indexOf(image) === index
        )
      : [];

    if (uniqueImages.length > 0) {
      return uniqueImages;
    }

    return [product.image];
  }, [product.image, product.images]);

  const pricing = useMemo(() => {
    const discount = product.discountPercent
      ? Math.min(Math.max(product.discountPercent, 0), 95)
      : 0;
    const hasDiscount = discount > 0;
    const discountedPrice = hasDiscount
      ? Math.round(product.price * (1 - discount / 100))
      : product.price;

    return { discount, hasDiscount, discountedPrice };
  }, [product.discountPercent, product.price]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: pricing.discountedPrice,
      amount: 1,
      size: selectedSize,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.dispatchEvent(new Event("cart:open"));
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-stretch gap-8 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-8 md:grid-cols-2">
        <div className="order-2 flex flex-col md:order-1">
          <div className="mb-4 flex flex-wrap gap-2">
            {product.isNew && (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
                Nuevo
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="secondary" className="bg-amber-200 text-amber-900">
                Destacado
              </Badge>
            )}
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h2>
          <p className="mt-3 max-w-xl break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <p className="text-2xl font-semibold">
              {formatPrice(pricing.discountedPrice)}
            </p>
            {pricing.hasDiscount && (
              <>
                <p className="text-base text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </p>
                <Badge variant="outline">-{pricing.discount}%</Badge>
              </>
            )}
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-foreground">Talle</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const active = selectedSize === size;
                return (
                  <Button
                    key={size}
                    type="button"
                    variant={active ? "default" : "outline"}
                    className="min-w-11"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={active}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" type="button" onClick={handleAddToCart}>
              Agregar al Carrito
            </Button>
            <Button size="lg" variant="outline" type="button" onClick={handleBuyNow}>
              Comprar Ahora
            </Button>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {imageUrls.length > 1 ? (
            <Carousel
              opts={{ align: "start", containScroll: "trimSnaps" }}
              className="rounded-2xl"
            >
              <CarouselContent className="-ml-0">
                {imageUrls.map((imageUrl, index) => (
                  <CarouselItem key={`${imageUrl}-${index}`} className="pl-0">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                      <Image
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3 bg-background/90" />
              <CarouselNext className="right-3 bg-background/90" />
            </Carousel>
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
              <Image
                src={imageUrls[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <ProductCarouselSection
        id="similares"
        eyebrow="Suggested"
        title="Productos similares"
        description="Opciones relacionadas para completar la compra."
        products={similarProducts}
      />
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Landmark,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
} from "lucide-react";

import { ProductCarouselSection } from "@/components/site/product-carousel-section";
import { type ProductCardData } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";

type ProductShowcaseSectionProps = {
  product: ProductCardData;
  similarProducts: ProductCardData[];
};

const fallbackSizes = ["XS", "S", "M", "L", "XL"];

const variantTypeLabel: Record<NonNullable<ProductCardData["variantType"]>, string> = {
  talle: "Talle",
  color: "Color",
  tamano: "Tamano",
  material: "Material",
  otro: "Variante",
};

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const hasVariants = Boolean(product.variantType && product.variants?.length);
  const optionType = hasVariants ? product.variantType ?? "otro" : "talle";
  const optionLabel = hasVariants
    ? variantTypeLabel[product.variantType ?? "otro"]
    : "Talle";
  const optionValues = hasVariants
    ? (product.variants ?? []).map((variant) => variant.value)
    : fallbackSizes;
  const [selectedOption, setSelectedOption] = useState(
    optionValues.find(Boolean) ?? ""
  );

  const selectedVariant = useMemo(() => {
    if (!hasVariants) {
      return null;
    }

    return (
      product.variants?.find((variant) => variant.value === selectedOption) ??
      product.variants?.[0] ??
      null
    );
  }, [hasVariants, product.variants, selectedOption]);

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
    const basePrice = selectedVariant?.price ?? product.price;
    const baseDiscount = selectedVariant?.discountPercent ?? product.discountPercent ?? 0;
    const discount = Math.min(Math.max(baseDiscount, 0), 95);
    const hasDiscount = discount > 0;
    const discountedPrice = hasDiscount
      ? Math.round(basePrice * (1 - discount / 100))
      : basePrice;

    return { basePrice, discount, hasDiscount, discountedPrice };
  }, [product.discountPercent, product.price, selectedVariant]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: pricing.discountedPrice,
      amount: quantity,
      size: selectedOption,
      optionType,
      optionValue: selectedOption,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.dispatchEvent(new Event("cart:open"));
  };

  const installmentsThree = Math.ceil(pricing.discountedPrice / 3);
  const installmentsSix = Math.ceil(pricing.discountedPrice / 6);
  const averageRating = 4.8;
  const reviewsCount = 124;

  const selectedImage = imageUrls[selectedImageIndex] ?? imageUrls[0];

  return (
    <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        <Link href="/" className="transition hover:text-foreground">
          Inicio
        </Link>
        <span aria-hidden>/</span>
        <Link href="/search" className="transition hover:text-foreground">
          Tienda
        </Link>
        <span aria-hidden>/</span>
        <span className="max-w-[20ch] truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-4">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-border/70 bg-muted/30">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-2">
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
          </div>

          {imageUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {imageUrls.map((imageUrl, index) => {
                const isActive = selectedImageIndex === index;

                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl border transition ${isActive
                      ? "border-foreground shadow-sm"
                      : "border-border/70 opacity-85 hover:opacity-100"
                      }`}
                    aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                    aria-pressed={isActive}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${product.name} miniatura ${index + 1}`}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-center gap-10 rounded-2xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Truck className="size-4 text-foreground" />
              Envio rapido a todo el pais
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-foreground" />
              Compra segura y protegida
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Producto
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 wrap-break-word text-sm leading-relaxed text-muted-foreground sm:text-base">
            {product.description}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-3 border-y border-border/70 py-5">
            <p className="text-3xl font-semibold">{formatPrice(pricing.discountedPrice)}</p>
            {pricing.hasDiscount && (
              <>
                <p className="text-base text-muted-foreground line-through">
                  {formatPrice(pricing.basePrice)}
                </p>
                <Badge variant="outline">-{pricing.discount}%</Badge>
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-foreground">{optionLabel}</p>
            <div className="flex flex-wrap gap-2">
              {optionValues.map((optionValue) => {
                const active = selectedOption === optionValue;

                return (
                  <Button
                    key={optionValue}
                    type="button"
                    variant={active ? "default" : "outline"}
                    className="min-w-11"
                    onClick={() => setSelectedOption(optionValue)}
                    aria-pressed={active}
                  >
                    {optionValue}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-foreground">Cantidad</p>
            <div className="inline-flex items-center rounded-full border border-border/80 bg-background">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                aria-label="Quitar una unidad"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold text-foreground">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                disabled={quantity >= 10}
                aria-label="Agregar una unidad"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button size="lg" type="button" onClick={handleAddToCart} className="w-full">
              Agregar al Carrito ({quantity})
            </Button>
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={handleBuyNow}
              className="w-full"
            >
              Comprar Ahora
            </Button>
          </div>

          <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
            <p>SKU: {product.id}</p>
            <p className="mt-1">
              {optionLabel} seleccionado: <span className="font-medium text-foreground">{selectedOption || "Sin seleccionar"}</span>
            </p>
            <p className="mt-1">
              Cantidad: <span className="font-medium text-foreground">{quantity}</span>
            </p>
            <p className="mt-1">Stock sujeto a disponibilidad.</p>
          </div>

          <div className="mt-6 grid gap-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden />
              Entrega estimada entre 24 y 72 horas.
            </p>
            <p className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden />
              Soporte por WhatsApp para seguimiento de pedido.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Opiniones de clientes
            </h2>
            <p className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-current text-amber-500" />
              {averageRating} de 5 ({reviewsCount} reseñas)
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Camila R.",
                rating: 5,
                text: "La calidad supero mis expectativas y el envio llego al dia siguiente.",
              },
              {
                name: "Matias V.",
                rating: 5,
                text: "El talle coincide perfecto y la atencion por WhatsApp fue excelente.",
              },
              {
                name: "Sofia M.",
                rating: 4,
                text: "Muy comodo y bien terminado. Volveria a comprar sin dudas.",
              },
            ].map((review) => (
              <article
                key={review.name}
                className="rounded-2xl border border-border/70 bg-background p-4"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={`${review.name}-${index}`}
                      className={`size-4 ${index < review.rating ? "fill-current" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                <p className="mt-4 text-sm font-medium text-foreground">{review.name}</p>
              </article>
            ))}
          </div>
        </div>

        <ProductCarouselSection
          id="similares"
          eyebrow="Recomendados"
          title="Productos similares"
          description="Opciones relacionadas para completar la compra."
          products={similarProducts}
        />
      </div>
    </section>
  );
}

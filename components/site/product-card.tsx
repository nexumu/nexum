"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addToCart } from "@/lib/cart";

export type ProductCardData = {
  id: string;
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  discountPercent?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  variantType?: "talle" | "color" | "tamano" | "material" | "otro";
  variants?: {
    id: string;
    value: string;
    price: number;
    discountPercent?: number;
  }[];
};

type ProductCardProps = ProductCardData;

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

export function ProductCard({
  id,
  name,
  description,
  image,
  price,
  discountPercent,
  isNew,
  isFeatured,
  variantType,
  variants,
}: ProductCardProps) {
  const router = useRouter();
  const hasVariants = Boolean(variantType && variants?.length);
  const firstVariant = hasVariants ? variants?.[0] : undefined;
  const [selectedVariantId, setSelectedVariantId] = useState(firstVariant?.id ?? "");

  const selectedVariant = useMemo(() => {
    if (!hasVariants) {
      return null;
    }

    return variants?.find((variant) => variant.id === selectedVariantId) ?? firstVariant ?? null;
  }, [firstVariant, hasVariants, selectedVariantId, variants]);

  const pricing = useMemo(() => {
    const basePrice = selectedVariant?.price ?? price;
    const baseDiscount = selectedVariant?.discountPercent ?? discountPercent ?? 0;
    const discount = Math.min(Math.max(baseDiscount, 0), 95);
    const hasDiscount = discount > 0;
    const discountedPrice = hasDiscount
      ? Math.round(basePrice * (1 - discount / 100))
      : basePrice;

    return { basePrice, discount, hasDiscount, discountedPrice };
  }, [discountPercent, price, selectedVariant]);

  const handleAddToCart = () => {
    const optionType = variantType ?? "talle";
    const optionValue = selectedVariant?.value ?? "Unico";

    addToCart({
      id,
      name,
      price: pricing.discountedPrice,
      amount: 1,
      size: optionValue,
      optionType,
      optionValue,
    });
  };

  return (
    <Card
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-border/70 bg-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      role="link"
      tabIndex={0}
      aria-label={`Ver detalle de ${name}`}
      onClick={() => router.push(`/product/${id}`)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/product/${id}`);
        }
      }}
    >

      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 80vw, (max-width: 1280px) 40vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap gap-2">
          {isNew && (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
              Nuevo
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="secondary" className="bg-amber-200 text-amber-900">
              Destacado
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="line-clamp-1 text-base leading-tight sm:text-lg">{name}</CardTitle>
        <CardDescription className="line-clamp-2 break-words text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto space-y-4 pt-0 pb-4 sm:pb-5">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-foreground">
            {formatPrice(pricing.discountedPrice)}
          </p>
          {pricing.hasDiscount && (
            <>
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(pricing.basePrice)}
              </p>
              <Badge variant="outline" className="text-[10px]">
                -{pricing.discount}%
              </Badge>
            </>
          )}
        </div>

        {hasVariants && variantType && (
          <div className="space-y-1.5" onClick={(event) => event.stopPropagation()}>
            <label
              htmlFor={`product-variant-${id}`}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {variantTypeLabel[variantType]}
            </label>
            <select
              id={`product-variant-${id}`}
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            >
              {variants?.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.value}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          type="button"
          className="h-10 w-full"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleAddToCart();
          }}
        >
          Agregar al carrito
        </Button>
      </CardContent>
    </Card>
  );
}

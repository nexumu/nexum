import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
}: ProductCardProps) {
  const discount = discountPercent ? Math.min(Math.max(discountPercent, 0), 95) : 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(price * (1 - discount / 100))
    : price;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition hover:shadow-md">
      <Link href={`/product/${id}`} className="group relative block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1280px) 40vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
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
      </Link>

      <CardHeader>
        <CardTitle className="text-lg">
          <Link href={`/product/${id}`} className="hover:underline">
            {name}
          </Link>
        </CardTitle>
        <CardDescription className="break-words text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-foreground">
            {formatPrice(discountedPrice)}
          </p>
          {hasDiscount && (
            <>
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(price)}
              </p>
              <Badge variant="outline" className="text-[10px]">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/product/${id}`}>Ver detalle</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

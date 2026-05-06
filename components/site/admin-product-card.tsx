"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

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
import { type ProductCardData } from "@/components/site/product-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase/client";
import { Trash2 } from "lucide-react";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type AdminProductCardProps = ProductCardData;

export function AdminProductCard({
  id,
  name,
  description,
  image,
  price,
  discountPercent,
  isNew,
  isFeatured,
}: AdminProductCardProps) {
  const editHref = `/admin/productos/nuevo?productId=${encodeURIComponent(id)}`;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const discount = discountPercent ? Math.min(Math.max(discountPercent, 0), 95) : 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(price * (1 - discount / 100))
    : price;

  const handleDelete = () => {
    startDeleting(async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data() as Record<string, unknown> | undefined;
        const publicIdsFromItems = Array.isArray(data?.imageItems)
          ? data?.imageItems
              .map((item) => {
                if (!item || typeof item !== "object") return null;
                const source = item as Record<string, unknown>;
                return typeof source.publicId === "string" ? source.publicId : null;
              })
              .filter((publicId): publicId is string => Boolean(publicId))
          : [];
        const publicIdsFromLegacy = Array.isArray(data?.imagePublicIds)
          ? data?.imagePublicIds.filter(
              (publicId): publicId is string => typeof publicId === "string"
            )
          : [];
        const publicIds = Array.from(
          new Set([...publicIdsFromItems, ...publicIdsFromLegacy])
        );

        if (publicIds.length > 0) {
          await fetch("/api/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicIds }),
          });
        }

        await deleteDoc(docRef);
        setDeleteDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-5/4 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 90vw, (max-width: 1280px) 40vw, 25vw"
          className="object-cover"
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

      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="wrap-break-word text-sm leading-relaxed">
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

      <CardFooter className="gap-2">
        <Button variant="secondary" className="w-full" asChild>
          <Link href={editHref}>Editar</Link>
        </Button>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive" size="icon" aria-label="Eliminar">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar producto</DialogTitle>
              <DialogDescription>
                Esta acción eliminará "{name}" y sus imágenes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

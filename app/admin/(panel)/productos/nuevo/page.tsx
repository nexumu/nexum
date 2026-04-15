"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProductFormState = {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  isNew: boolean;
  isFeatured: boolean;
  categoryName: string;
  subcategoryName: string;
};

const initialState: ProductFormState = {
  id: "",
  name: "",
  description: "",
  price: "",
  discountPercent: "",
  isNew: false,
  isFeatured: false,
  categoryName: "",
  subcategoryName: "",
};

type CategoryOption = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

const categoriesCollection = collection(db, "categories");

export default function AdminNewProductPage() {
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateField = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snapshot = await getDocs(
          query(categoriesCollection, orderBy("createdAt", "desc"))
        );
        const data = snapshot.docs.map((docSnap) => {
          const docData = docSnap.data() as {
            name?: string;
            subcategories?: { id: string; name: string }[];
          };
          return {
            id: docSnap.id,
            name: docData.name ?? "Sin nombre",
            subcategories: docData.subcategories ?? [],
          };
        });
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedId = form.id.trim();
    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const trimmedPrice = form.price.trim();
    const priceValue = Number(trimmedPrice);
    const discountValue = form.discountPercent ? Number(form.discountPercent) : null;

    if (
      !trimmedId ||
      !trimmedName ||
      !trimmedDescription ||
      !form.categoryName ||
      trimmedPrice === "" ||
      Number.isNaN(priceValue)
    ) {
      setError("Completá los campos obligatorios con valores válidos.");
      return;
    }

    if (!imageFile) {
      setError("Seleccioná una imagen para el producto.");
      return;
    }

    if (discountValue !== null && Number.isNaN(discountValue)) {
      setError("El descuento debe ser un número válido.");
      return;
    }

    startTransition(async () => {
      try {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        uploadData.append("folder", "products");

        const uploadResponse = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const uploadResult = (await uploadResponse.json()) as {
          url: string;
          publicId: string;
        };

        const payload: Record<string, unknown> = {
          id: trimmedId,
          name: trimmedName,
          nameLower: trimmedName.toLowerCase(),
          description: trimmedDescription,
          price: priceValue,
          isNew: form.isNew,
          isFeatured: form.isFeatured,
          image: uploadResult.url,
          imagePublicId: uploadResult.publicId,
          categoryName: form.categoryName,
          subcategoryName: form.subcategoryName || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (discountValue !== null) {
          payload.discountPercent = discountValue;
        }

        await setDoc(doc(db, "products", trimmedId), payload, { merge: true });
        setSuccess(true);
        setForm(initialState);
        setImageFile(null);
        router.push("/admin/productos");
      } catch (submitError) {
        console.error(submitError);
        setError("No se pudo guardar el producto. Intentá nuevamente.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Productos
        </p>
        <h1 className="text-2xl font-semibold">Crear nuevo producto</h1>
        <p className="text-sm text-muted-foreground">
          Guardá un nuevo producto en Firebase y subí la imagen a Cloudinary.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del producto</CardTitle>
          <CardDescription>
            Los campos marcados son obligatorios para publicar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                ID / Slug
                <Input
                  value={form.id}
                  onChange={(event) => updateField("id", event.target.value)}
                  placeholder="nocturne-blazer"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Nombre
                <Input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Nocturne Blazer"
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Descripción
              <Textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Detalle corto del producto."
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Categoría
                <select
                  value={form.categoryName}
                  onChange={(event) => {
                    updateField("categoryName", event.target.value);
                    updateField("subcategoryName", "");
                  }}
                  required
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Seleccioná una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Subcategoría
                <select
                  value={form.subcategoryName}
                  onChange={(event) =>
                    updateField("subcategoryName", event.target.value)
                  }
                  disabled={!form.categoryName}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Sin subcategoría</option>
                  {categories
                    .find((category) => category.name === form.categoryName)
                    ?.subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.name}>
                        {subcategory.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Precio
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="129"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Descuento (%)
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.discountPercent}
                  onChange={(event) => updateField("discountPercent", event.target.value)}
                  placeholder="15"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Imagen (archivo)
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  required
                />
              </label>
            </div>

            {previewUrl ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Vista previa
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="h-48 w-full rounded-md border border-border/70 object-cover"
                />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-border/70 px-3 py-2 text-sm font-medium">
                <Checkbox
                  checked={form.isNew}
                  onCheckedChange={(checked) =>
                    updateField("isNew", Boolean(checked))
                  }
                />
                Producto nuevo
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border/70 px-3 py-2 text-sm font-medium">
                <Checkbox
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    updateField("isFeatured", Boolean(checked))
                  }
                />
                Producto destacado
              </label>
            </div>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                Producto creado correctamente.
              </p>
            ) : null}

            <CardFooter className="flex flex-wrap justify-end gap-3 px-0">
              <Button type="button" variant="ghost" asChild>
                <Link href="/admin/productos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar producto"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

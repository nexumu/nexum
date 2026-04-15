"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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

type ProductVariantType = "talle" | "color" | "tamano" | "material" | "otro";

type ProductVariantDraft = {
  id: string;
  value: string;
  price: string;
  discountPercent: string;
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

function createVariantId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getVariantTypeLabel(variantType: ProductVariantType) {
  switch (variantType) {
    case "talle":
      return "Talle";
    case "color":
      return "Color";
    case "tamano":
      return "Tamaño";
    case "material":
      return "Material";
    default:
      return "Variante";
  }
}

export default function AdminNewProductPage() {
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [variantType, setVariantType] = useState<ProductVariantType>("talle");
  const [variants, setVariants] = useState<ProductVariantDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const previewUrls = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles]
  );

  const updateField = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      {
        id: createVariantId(),
        value: "",
        price: form.price.trim(),
        discountPercent: form.discountPercent.trim(),
      },
    ]);
  };

  const updateVariantField = (
    variantId: string,
    field: keyof Omit<ProductVariantDraft, "id">,
    value: string
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (variantId: string) => {
    setVariants((current) => current.filter((variant) => variant.id !== variantId));
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [previewUrls]);

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
    const sanitizedVariants = variants.map((variant) => ({
      id: variant.id,
      value: variant.value.trim(),
      price: variant.price.trim(),
      discountPercent: variant.discountPercent.trim(),
    }));

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

    if (imageFiles.length === 0) {
      setError("Seleccioná al menos una imagen para el producto.");
      return;
    }

    if (discountValue !== null && Number.isNaN(discountValue)) {
      setError("El descuento debe ser un número válido.");
      return;
    }

    if (sanitizedVariants.some((variant) => !variant.value)) {
      setError(`Completá el valor de cada ${getVariantTypeLabel(variantType).toLowerCase()}.`);
      return;
    }

    if (
      sanitizedVariants.some(
        (variant) => variant.price === "" || Number.isNaN(Number(variant.price))
      )
    ) {
      setError("Cada variante debe tener un precio válido.");
      return;
    }

    if (
      sanitizedVariants.some(
        (variant) =>
          variant.discountPercent !== "" &&
          Number.isNaN(Number(variant.discountPercent))
      )
    ) {
      setError("El descuento de cada variante debe ser un número válido.");
      return;
    }

    startTransition(async () => {
      try {
        const uploadResults = await Promise.all(
          imageFiles.map(async (imageFile) => {
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

            return (await uploadResponse.json()) as {
              url: string;
              publicId: string;
            };
          })
        );

        const imageUrls = uploadResults.map((result) => result.url);
        const imagePublicIds = uploadResults.map((result) => result.publicId);

        const payload: Record<string, unknown> = {
          id: trimmedId,
          name: trimmedName,
          nameLower: trimmedName.toLowerCase(),
          description: trimmedDescription,
          price: priceValue,
          isNew: form.isNew,
          isFeatured: form.isFeatured,
          image: imageUrls[0],
          images: imageUrls,
          imagePublicIds,
          categoryName: form.categoryName,
          subcategoryName: form.subcategoryName || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (discountValue !== null) {
          payload.discountPercent = discountValue;
        }

        if (sanitizedVariants.length > 0) {
          payload.variantType = variantType;
          payload.variants = sanitizedVariants.map((variant) => {
            const variantPrice = Number(variant.price);
            const variantDiscount =
              variant.discountPercent === "" ? discountValue : Number(variant.discountPercent);

            return {
              id: variant.id,
              value: variant.value,
              price: variantPrice,
              ...(variantDiscount !== null ? { discountPercent: variantDiscount } : {}),
            };
          });
        }

        await setDoc(doc(db, "products", trimmedId), payload, { merge: true });
        setSuccess(true);
        setForm(initialState);
        setVariantType("talle");
        setVariants([]);
        setImageFiles([]);
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
                  multiple
                  onChange={(event) =>
                    setImageFiles(Array.from(event.target.files ?? []))
                  }
                  required
                />
              </label>
            </div>

            <div className="rounded-md border border-border/70 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Variantes del producto</p>
                  <p className="text-xs text-muted-foreground">
                    Elegí el tipo de variante y agregá opciones con precio y descuento.
                  </p>
                </div>

                <div className="flex items-end gap-2">
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Tipo de variante
                    <select
                      value={variantType}
                      onChange={(event) =>
                        setVariantType(event.target.value as ProductVariantType)
                      }
                      className="h-10 min-w-40 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="talle">Talle</option>
                      <option value="color">Color</option>
                      <option value="tamano">Tamaño</option>
                      <option value="material">Material</option>
                      <option value="otro">Otro</option>
                    </select>
                  </label>
                  <Button type="button" variant="outline" onClick={addVariant}>
                    Agregar variante
                  </Button>
                </div>
              </div>

              {variants.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="grid gap-3 rounded-md border border-border/70 p-3 sm:grid-cols-[1fr_140px_140px_auto] sm:items-end"
                    >
                      <label className="flex flex-col gap-2 text-sm font-medium">
                        {getVariantTypeLabel(variantType)} #{index + 1}
                        <Input
                          value={variant.value}
                          onChange={(event) =>
                            updateVariantField(variant.id, "value", event.target.value)
                          }
                          placeholder={
                            variantType === "talle"
                              ? "M"
                              : variantType === "color"
                              ? "Negro"
                              : variantType === "tamano"
                              ? "500 ml"
                              : variantType === "material"
                              ? "Cuero"
                              : "Valor"
                          }
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Precio
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(event) =>
                            updateVariantField(variant.id, "price", event.target.value)
                          }
                          placeholder={form.price || "129"}
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Descuento (%)
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.discountPercent}
                          onChange={(event) =>
                            updateVariantField(
                              variant.id,
                              "discountPercent",
                              event.target.value
                            )
                          }
                          placeholder={form.discountPercent || "0"}
                        />
                      </label>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeVariant(variant.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Sin variantes cargadas. Si no agregás variantes, se guarda solo el producto base.
                </p>
              )}
            </div>

            {previewUrls.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Vista previa ({previewUrls.length})
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {previewUrls.map((previewUrl, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${previewUrl}-${index}`}
                      src={previewUrl}
                      alt={`Vista previa ${index + 1}`}
                      className="h-48 w-full rounded-md border border-border/70 object-cover"
                    />
                  ))}
                </div>
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

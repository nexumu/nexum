"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
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
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

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

type ImageItem = {
  id: string;
  url: string;
  publicId: string | null;
  order: number;
  file?: File;
};

type ProductImageRecord = {
  url: string;
  publicId: string | null;
  order: number;
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
const productsCollection = collection(db, "products");

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
  const [images, setImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const isEditing = Boolean(productId);
  const hasLoadedProduct = useRef(false);
  const originalPublicIdsRef = useRef<string[]>([]);

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
      images.forEach((image) => {
        if (image.file) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

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

  useEffect(() => {
    if (!productId || hasLoadedProduct.current) return;
    hasLoadedProduct.current = true;

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      setError(null);
      try {
        const docSnap = await getDoc(doc(productsCollection, productId));
        if (!docSnap.exists()) {
          setError("No se encontró el producto a editar.");
          return;
        }

        const data = docSnap.data() as Record<string, unknown>;
        const priceValue = Number(data.price ?? 0);
        const discountValue = data.discountPercent;
        const normalizedDiscount =
          discountValue === undefined || discountValue === null
            ? ""
            : String(discountValue);

        const nextForm: ProductFormState = {
          id: String(data.id ?? productId),
          name: String(data.name ?? ""),
          description: String(data.description ?? ""),
          price: Number.isNaN(priceValue) ? "" : String(priceValue),
          discountPercent: normalizedDiscount,
          isNew: Boolean(data.isNew),
          isFeatured: Boolean(data.isFeatured),
          categoryName: String(data.categoryName ?? ""),
          subcategoryName: String(data.subcategoryName ?? ""),
        };
        setForm(nextForm);

        const rawVariantType = data.variantType;
        if (
          rawVariantType === "talle" ||
          rawVariantType === "color" ||
          rawVariantType === "tamano" ||
          rawVariantType === "material" ||
          rawVariantType === "otro"
        ) {
          setVariantType(rawVariantType);
        }

        const rawVariants = Array.isArray(data.variants)
          ? data.variants
          : [];
        const loadedVariants = rawVariants
          .map((variant, index) => {
            if (!variant || typeof variant !== "object") return null;
            const source = variant as Record<string, unknown>;
            const value = String(source.value ?? "").trim();
            const price = String(source.price ?? "").trim();
            const discountRaw = source.discountPercent;
            const discount =
              discountRaw === undefined || discountRaw === null
                ? ""
                : String(discountRaw);
            if (!value) return null;
            return {
              id: String(source.id ?? `${productId}-variant-${index}`),
              value,
              price,
              discountPercent: discount,
            };
          })
          .filter((variant): variant is ProductVariantDraft => Boolean(variant));
        setVariants(loadedVariants);

        const rawImages = Array.isArray(data.images)
          ? data.images
          : [];
        const rawPublicIds = Array.isArray(data.imagePublicIds)
          ? data.imagePublicIds
          : [];
        const rawImageItems = Array.isArray(data.imageItems)
          ? data.imageItems
          : [];

        let nextImages: ImageItem[] = [];

        if (rawImageItems.length > 0) {
          nextImages = rawImageItems
            .map((item, index) => {
              if (!item || typeof item !== "object") return null;
              const source = item as Record<string, unknown>;
              const url = String(source.url ?? "");
              if (!url) return null;
              const order = Number(source.order ?? index);
              return {
                id: `existing-${index}-${url}`,
                url,
                publicId:
                  typeof source.publicId === "string" && source.publicId
                    ? source.publicId
                    : null,
                order: Number.isNaN(order) ? index : order,
              } as ImageItem;
            })
            .filter((image): image is ImageItem => Boolean(image))
            .sort((a, b) => a.order - b.order);
        } else {
          const fallbackImages = rawImages.filter(
            (image): image is string => typeof image === "string" && Boolean(image)
          );
          nextImages = fallbackImages.map((url, index) => ({
            id: `existing-${index}-${url}`,
            url,
            publicId:
              typeof rawPublicIds[index] === "string" ? rawPublicIds[index] : null,
            order: index,
          }));
        }

        setImages(nextImages);
        originalPublicIdsRef.current = nextImages
          .map((image) => image.publicId)
          .filter((publicId): publicId is string => Boolean(publicId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el producto.");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProduct();
  }, [productId]);

  const addImages = (files: File[]) => {
    if (files.length === 0) return;
    setImages((current) => {
      const baseOrder = current.length;
      const next = files.map((file, index) => {
        const url = URL.createObjectURL(file);
        return {
          id: `new-${crypto.randomUUID()}`,
          url,
          publicId: null,
          order: baseOrder + index,
          file,
        } as ImageItem;
      });
      return [...current, ...next];
    });
  };

  const removeImage = (imageId: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === imageId);
      if (target?.file) {
        URL.revokeObjectURL(target.url);
      }
      return current
        .filter((image) => image.id !== imageId)
        .map((image, index) => ({ ...image, order: index }));
    });
  };

  const moveImage = (imageId: string, direction: "up" | "down") => {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === imageId);
      if (index < 0) return current;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= current.length) return current;
      const next = [...current];
      const temp = next[index];
      next[index] = next[swapWith];
      next[swapWith] = temp;
      return next.map((image, idx) => ({ ...image, order: idx }));
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedId = form.id.trim();
    const docId = isEditing && productId ? productId : trimmedId;
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
      !docId ||
      !trimmedName ||
      !trimmedDescription ||
      !form.categoryName ||
      trimmedPrice === "" ||
      Number.isNaN(priceValue)
    ) {
      setError("Completá los campos obligatorios con valores válidos.");
      return;
    }

    if (images.length === 0) {
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
        const existingImages = images.filter((image) => !image.file);
        const newImages = images.filter((image) => image.file);

        const uploadResults = await Promise.all(
          newImages.map(async (image) => {
            const uploadData = new FormData();
            uploadData.append("file", image.file as File);
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

        let uploadIndex = 0;
        const mergedImages = images.map((image) => {
          if (!image.file) {
            return {
              url: image.url,
              publicId: image.publicId,
              order: image.order,
            } satisfies ProductImageRecord;
          }
          const result = uploadResults[uploadIndex];
          uploadIndex += 1;
          if (!result) {
            throw new Error("Upload mismatch");
          }
          return {
            url: result.url,
            publicId: result.publicId,
            order: image.order,
          } satisfies ProductImageRecord;
        });

        const orderedImages = mergedImages
          .slice()
          .sort((a, b) => a.order - b.order);
        const imageUrls = orderedImages.map((image) => image.url);
        const imagePublicIds = orderedImages.map((image) => image.publicId);

        if (isEditing) {
          const previousPublicIds = originalPublicIdsRef.current;
          const currentPublicIds = orderedImages
            .map((image) => image.publicId)
            .filter((publicId): publicId is string => Boolean(publicId));
          const removedPublicIds = previousPublicIds.filter(
            (publicId) => !currentPublicIds.includes(publicId)
          );

          if (removedPublicIds.length > 0) {
            await fetch("/api/cloudinary/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicIds: removedPublicIds }),
            });
          }
        }

        const payload: Record<string, unknown> = {
          id: docId,
          name: trimmedName,
          nameLower: trimmedName.toLowerCase(),
          description: trimmedDescription,
          price: priceValue,
          isNew: form.isNew,
          isFeatured: form.isFeatured,
          image: imageUrls[0],
          images: imageUrls,
          imagePublicIds,
          imageItems: orderedImages,
          categoryName: form.categoryName,
          subcategoryName: form.subcategoryName || null,
          updatedAt: serverTimestamp(),
        };

        if (!isEditing) {
          payload.createdAt = serverTimestamp();
        }

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

        await setDoc(doc(db, "products", docId), payload, { merge: true });
        setSuccess(true);
        setForm(initialState);
        setVariantType("talle");
        setVariants([]);
        setImages([]);
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
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Editar producto" : "Crear nuevo producto"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Actualizá la información del producto."
            : "Guardá un nuevo producto."}
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
                  disabled={isEditing}
                  className="h-11"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Nombre
                <Input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Nocturne Blazer"
                  required
                  className="h-11"
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
                className="min-h-28"
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
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm"
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
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
                  placeholder="500"
                  required
                  className="h-11"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Descuento (%)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountPercent}
                  onChange={(event) => updateField("discountPercent", event.target.value)}
                  placeholder="15"
                  className="h-11"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Imagen (archivo)
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    addImages(Array.from(event.target.files ?? []))
                  }
                  required={!isEditing}
                  className="h-11"
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

                <div className="flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Tipo de variante
                    <select
                      value={variantType}
                      onChange={(event) =>
                        setVariantType(event.target.value as ProductVariantType)
                      }
                      className="h-11 min-w-40 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="talle">Talle</option>
                      <option value="color">Color</option>
                      <option value="tamano">Tamaño</option>
                      <option value="material">Material</option>
                      <option value="otro">Otro</option>
                    </select>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    className="w-full sm:w-auto"
                  >
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
                          className="h-11"
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
                          placeholder={form.price || "150"}
                          className="h-11"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Descuento (%)
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.discountPercent}
                          onChange={(event) =>
                            updateVariantField(
                              variant.id,
                              "discountPercent",
                              event.target.value
                            )
                          }
                          placeholder={form.discountPercent || "0"}
                          className="h-11"
                        />
                      </label>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeVariant(variant.id)}
                        className="w-full sm:w-auto"
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

            {images.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Vista previa ({images.length})
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {images
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => (
                      <div
                        key={image.id}
                        className="rounded-md border border-border/70 p-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={`Vista previa ${index + 1}`}
                          className="h-40 w-full rounded-md object-cover"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => moveImage(image.id, "up")}
                              disabled={index === 0}
                              aria-label="Mover arriba"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => moveImage(image.id, "down")}
                              disabled={index === images.length - 1}
                              aria-label="Mover abajo"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeImage(image.id)}
                            aria-label="Eliminar imagen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                {isEditing
                  ? "Producto actualizado correctamente."
                  : "Producto creado correctamente."}
              </p>
            ) : null}

            <CardFooter className="flex flex-wrap justify-end gap-3 px-0">
              <Button type="button" variant="ghost" asChild>
                <Link href="/admin/productos">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={isPending || isLoadingProduct}
                className="w-full sm:w-auto"
              >
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar producto"
                    : "Guardar producto"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

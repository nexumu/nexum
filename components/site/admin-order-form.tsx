"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/site/product-card";

type OrderItemDraft = {
  id: string;
  name: string;
  price: string;
  amount: string;
  size: string;
  optionType: "talle" | "color" | "tamano" | "material" | "otro";
  optionValue: string;
  selectedProductId?: string;
  selectedVariantId?: string;
};

type OrderFormState = {
  customerName: string;
  address: string;
  whatsapp: string;
  shippingCost: string;
};

const initialForm: OrderFormState = {
  customerName: "",
  address: "",
  whatsapp: "",
  shippingCost: "0",
};

const initialItem: OrderItemDraft = {
  id: "",
  name: "",
  price: "",
  amount: "1",
  size: "",
  optionType: "talle",
  optionValue: "",
};

function createItem(): OrderItemDraft {
  return { ...initialItem };
}

export function AdminOrderForm({ products }: { products: ProductCardData[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OrderFormState>(initialForm);
  const [items, setItems] = useState<OrderItemDraft[]>([createItem()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof OrderFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateItem = (index: number, field: keyof OrderItemDraft, value: string) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const applyProductToItem = (index: number, product: ProductCardData) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          selectedProductId: product.id,
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          optionType: product.variantType || "talle",
          optionValue: "",
          selectedVariantId: "",
        };
      })
    );
  };

  const applyVariantToItem = (index: number, product: ProductCardData, variantId: string) => {
    const variant = product.variants?.find((v) => v.id === variantId);
    if (!variant) return;

    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          selectedVariantId: variant.id,
          id: variant.id,
          name: `${product.name} - ${variant.value}`,
          price: variant.price.toString(),
          optionValue: variant.value,
        };
      })
    );
  };

  const addItem = () => {
    setItems((current) => [...current, createItem()]);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
      setSuccess(null);
    }
    setOpen(newOpen);
  };

  const handleSubmit = () => {
    setError(null);
    setSuccess(null);

    const customerName = form.customerName.trim();
    const address = form.address.trim();
    const whatsapp = form.whatsapp.trim();
    const shippingCost = Number(form.shippingCost);

    if (!customerName || !address || !whatsapp) {
      setError("Completa nombre, direccion y WhatsApp.");
      return;
    }

    if (!Number.isFinite(shippingCost) || shippingCost < 0) {
      setError("El costo de envio debe ser un numero valido.");
      return;
    }

    const normalizedItems = items
      .map((item) => ({
        id: item.id.trim(),
        name: item.name.trim(),
        size: item.size.trim(),
        optionType: item.optionType,
        optionValue: item.optionValue.trim(),
        price: Number(item.price),
        amount: Number(item.amount),
      }))
      .filter((item) => item.id || item.name || item.size || item.optionValue || item.price);

    if (normalizedItems.length === 0) {
      setError("Agrega al menos un producto al pedido.");
      return;
    }

    const hasInvalidItem = normalizedItems.some(
      (item) =>
        !item.id ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isFinite(item.amount) ||
        item.amount <= 0
    );

    if (hasInvalidItem) {
      setError("Cada producto debe tener id, nombre, precio y cantidad validos.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName,
            address,
            whatsapp,
            shippingCost,
            source: "manual",
            items: normalizedItems,
          }),
        });

        const payload = (await response.json()) as { error?: string; id?: string };

        if (!response.ok) {
          setError(payload.error ?? "No se pudo guardar el pedido.");
          return;
        }

        setSuccess(`Pedido #${payload.id ?? ""} guardado correctamente.`);
        setForm(initialForm);
        setItems([createItem()]);
        router.refresh();
        setTimeout(() => setOpen(false), 2000);
      } catch (submitError) {
        console.error(submitError);
        setError("No se pudo guardar el pedido.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Agregar pedido manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar pedido manual</DialogTitle>
          <DialogDescription>
            Carga un pedido con cliente, direccion, envio y productos asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Nombre
              <Input
                value={form.customerName}
                onChange={(event) => updateField("customerName", event.target.value)}
                placeholder="Nombre del cliente"
                className="mt-1"
              />
            </label>
            <label className="text-sm font-medium">
              WhatsApp
              <Input
                value={form.whatsapp}
                onChange={(event) => updateField("whatsapp", event.target.value)}
                placeholder="+598 ..."
                className="mt-1"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <label className="text-sm font-medium">
              Direccion
              <Input
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Calle, numero, localidad"
                className="mt-1"
              />
            </label>
            <label className="text-sm font-medium">
              Costo de envio
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.shippingCost}
                onChange={(event) => updateField("shippingCost", event.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </label>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Productos del pedido</p>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </Button>
            </div>

            {items.map((item, index) => (
              <OrderItemRow
                key={`order-item-${index}`}
                item={item}
                index={index}
                products={products}
                onUpdate={updateItem}
                onRemove={() => removeItem(index)}
                canRemove={items.length > 1}
                onSelectProduct={(product) => applyProductToItem(index, product)}
                onSelectVariant={(product, variantId) => applyVariantToItem(index, product, variantId)}
              />
            ))}
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar pedido"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrderItemRow({
  item,
  index,
  products,
  onUpdate,
  onRemove,
  canRemove,
  onSelectProduct,
  onSelectVariant,
}: {
  item: OrderItemDraft;
  index: number;
  products: ProductCardData[];
  onUpdate: (index: number, field: keyof OrderItemDraft, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  onSelectProduct: (product: ProductCardData) => void;
  onSelectVariant: (product: ProductCardData, variantId: string) => void;
}) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const selectedProduct = products.find((p) => p.id === item.selectedProductId);

  return (
    <div className="relative grid gap-4 rounded-md border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Buscar Producto</label>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between bg-background"
              >
                {selectedProduct ? selectedProduct.name : "Seleccionar producto..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar por nombre o ID..." />
                <CommandList>
                  <CommandEmpty>No se encontraron productos.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={`${product.id} ${product.name}`}
                        onSelect={() => {
                          onSelectProduct(product);
                          setOpenCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs text-muted-foreground">ID: {product.id}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Variante ({selectedProduct.variantType || "talle"})</label>
            <select
              value={item.selectedVariantId || ""}
              onChange={(e) => onSelectVariant(selectedProduct, e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Seleccionar variante...</option>
              {selectedProduct.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.value} - ${v.price}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">
        <label className="text-sm font-medium xl:col-span-2">
          Nombre manual / ID
          <Input
            value={item.name}
            onChange={(event) => onUpdate(index, "name", event.target.value)}
            placeholder="Producto"
            className="mt-1 bg-background"
          />
        </label>
        <label className="text-sm font-medium">
          Precio
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.price}
            onChange={(event) => onUpdate(index, "price", event.target.value)}
            placeholder="100"
            className="mt-1 bg-background"
          />
        </label>
        <label className="text-sm font-medium">
          Cantidad
          <Input
            type="number"
            min="1"
            step="1"
            value={item.amount}
            onChange={(event) => onUpdate(index, "amount", event.target.value)}
            placeholder="1"
            className="mt-1 bg-background"
          />
        </label>

        <div className="flex items-end justify-end pt-2 xl:pt-0 h-10">
          <Button
            type="button"
            variant="destructive"
            onClick={onRemove}
            disabled={!canRemove}
            className="w-full shrink-0 bg-red-600 hover:bg-red-700 text-white"
            title="Eliminar producto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

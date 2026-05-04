"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type OrderItemDraft = {
  id: string;
  name: string;
  price: string;
  amount: string;
  size: string;
  optionType: "talle" | "color" | "tamano" | "material" | "otro";
  optionValue: string;
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

function createItem() {
  return { ...initialItem };
}

export function AdminOrderForm() {
  const router = useRouter();
  const [form, setForm] = useState<OrderFormState>(initialForm);
  const [items, setItems] = useState<OrderItemDraft[]>([createItem()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof OrderFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateItem = (
    index: number,
    field: keyof OrderItemDraft,
    value: string
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [...current, createItem()]);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
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
      } catch (submitError) {
        console.error(submitError);
        setError("No se pudo guardar el pedido.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar pedido manual</CardTitle>
        <CardDescription>
          Carga un pedido con cliente, direccion, envio y productos asociados.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Nombre
            <Input
              value={form.customerName}
              onChange={(event) => updateField("customerName", event.target.value)}
              placeholder="Nombre del cliente"
            />
          </label>
          <label className="text-sm font-medium">
            WhatsApp
            <Input
              value={form.whatsapp}
              onChange={(event) => updateField("whatsapp", event.target.value)}
              placeholder="+54 9 ..."
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
            />
          </label>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Productos del pedido</p>
            <Button type="button" variant="outline" onClick={addItem}>
              Agregar producto
            </Button>
          </div>

          {items.map((item, index) => (
            <div
              key={`order-item-${index}`}
              className="grid gap-3 rounded-md border border-border/70 p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="text-sm font-medium">
                ID producto
                <Input
                  value={item.id}
                  onChange={(event) => updateItem(index, "id", event.target.value)}
                  placeholder="sku-001"
                />
              </label>
              <label className="text-sm font-medium">
                Nombre
                <Input
                  value={item.name}
                  onChange={(event) => updateItem(index, "name", event.target.value)}
                  placeholder="Producto"
                />
              </label>
              <label className="text-sm font-medium">
                Precio
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(event) => updateItem(index, "price", event.target.value)}
                  placeholder="100"
                />
              </label>
              <label className="text-sm font-medium">
                Cantidad
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.amount}
                  onChange={(event) => updateItem(index, "amount", event.target.value)}
                  placeholder="1"
                />
              </label>
              <label className="text-sm font-medium">
                Tipo variante
                <select
                  value={item.optionType}
                  onChange={(event) =>
                    updateItem(index, "optionType", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="talle">Talle</option>
                  <option value="color">Color</option>
                  <option value="tamano">Tamano</option>
                  <option value="material">Material</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Valor variante
                <Input
                  value={item.optionValue}
                  onChange={(event) => updateItem(index, "optionValue", event.target.value)}
                  placeholder="Negro / M / 500ml"
                />
              </label>
              <label className="text-sm font-medium">
                Talle/size legado
                <Input
                  value={item.size}
                  onChange={(event) => updateItem(index, "size", event.target.value)}
                  placeholder="M"
                />
              </label>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Eliminar
                </Button>
              </div>
            </div>
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

        <div className="flex justify-end">
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar pedido"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

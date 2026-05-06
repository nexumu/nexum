import { AdminOrderForm } from "@/components/site/admin-order-form";
import { AdminOrderStatusSelect } from "@/components/site/admin-order-status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllOrders } from "@/lib/firebase/orders";
import { getAllProducts } from "@/lib/firebase/products";
import type { OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: Date) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function getStatusBadgeClasses(status: OrderStatus) {
  switch (status) {
    case "pendiente":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700";
    case "aceptado":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700";
    case "en camino":
      return "border-violet-500/40 bg-violet-500/10 text-violet-700";
    case "entregado":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
    case "cancelado":
      return "border-rose-500/40 bg-rose-500/10 text-rose-700";
    default:
      return "";
  }
}

function buildWhatsAppUrl(
  phone: string | undefined,
  customerName: string,
  items: { name: string; amount: number }[]
) {
  if (!phone) {
    return "";
  }

  const normalizedPhone = phone.replace(/\D/g, "");
  if (!normalizedPhone) {
    return "";
  }

  const productsText = items
    .map((item) => `${item.name} x${item.amount}`)
    .join(", ");
  const message = `Hola ${customerName} te escribo por el pedido realizado en nuestra web de Nexum por los siguientes productos: ${productsText}.`;
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Administra pedidos y agrega nuevos registros de forma manual.
          </p>
        </div>
        <AdminOrderForm products={products} />
      </header>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Listado de pedidos</h2>

        {orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-base">Pedido #{order.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClasses(order.status)}
                      >
                        {order.status}
                      </Badge>
                      <AdminOrderStatusSelect
                        orderId={order.id}
                        status={order.status}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {order.source === "manual" ? "Manual" : "Checkout"} - {formatDate(order.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <p>
                    <span className="font-medium">Cliente:</span> {order.customerName}
                  </p>
                  <p>
                    <span className="font-medium">Direccion:</span> {order.address}
                  </p>
                  <p>
                    <span className="font-medium">WhatsApp:</span> {order.whatsapp}
                  </p>
                  <div className="rounded-md border border-border/70 p-3">
                    <p className="mb-2 font-medium">Productos ({order.items.length})</p>
                    <ul className="grid gap-1 text-muted-foreground">
                      {order.items.map((item, index) => (
                        <li key={`${order.id}-item-${index}`}>
                          {item.name} x{item.amount} - {formatCurrency(item.price * item.amount)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <a
                        href={buildWhatsAppUrl(
                          order.whatsapp,
                          order.customerName,
                          order.items
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Enviar WhatsApp
                      </a>
                    </Button>
                  </div>
                  <div className="grid gap-1 text-sm">
                    <p>
                      <span className="font-medium">Subtotal:</span> {formatCurrency(order.subtotal)}
                    </p>
                    <p>
                      <span className="font-medium">Envio:</span> {formatCurrency(order.shippingCost)}
                    </p>
                    <p className="font-semibold">
                      Total: {formatCurrency(order.total)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            Aun no hay pedidos registrados.
          </div>
        )}
      </section>
    </div>
  );
}

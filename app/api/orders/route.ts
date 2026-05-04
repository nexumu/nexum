import { createOrder, updateOrderStatus } from "@/lib/firebase/orders";
import { sendBusinessOrderEmail } from "@/lib/email/mailer";
import {
  calculateOrderSubtotal,
  normalizeOrderItems,
  normalizeOrderStatus,
} from "@/lib/orders";

export const runtime = "nodejs";

type OrderRequestBody = {
  customerName?: unknown;
  address?: unknown;
  whatsapp?: unknown;
  shippingCost?: unknown;
  items?: unknown;
  source?: unknown;
};

type OrderStatusRequestBody = {
  orderId?: unknown;
  status?: unknown;
};

function toSafeText(value: unknown) {
  return String(value ?? "").trim();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequestBody;
    const customerName = toSafeText(body.customerName);
    const address = toSafeText(body.address);
    const whatsapp = toSafeText(body.whatsapp);
    const source = body.source === "manual" ? "manual" : "checkout";

    const shippingCost = Number(body.shippingCost ?? 0);
    const normalizedShippingCost =
      Number.isFinite(shippingCost) && shippingCost >= 0 ? shippingCost : 0;

    const items = normalizeOrderItems(body.items);

    if (!customerName || !address || !whatsapp) {
      return Response.json(
        { error: "Nombre, direccion y WhatsApp son obligatorios." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return Response.json(
        { error: "El pedido debe incluir al menos un producto." },
        { status: 400 }
      );
    }

    const createdOrder = await createOrder({
      customerName,
      address,
      whatsapp,
      shippingCost: normalizedShippingCost,
      items,
      source,
    });

    const subtotal = calculateOrderSubtotal(items);
    const total = subtotal + normalizedShippingCost;
    const itemLines = items
      .map((item) => {
        const variantLabel = item.optionValue || item.size || "Sin variante";
        return `- ${item.name} x${item.amount} (${variantLabel}) - ${formatCurrency(
          item.price * item.amount
        )}`;
      })
      .join("\n");

    const businessEmail = process.env.BUSINESS_ADMIN_EMAIL;
    if (businessEmail) {
      const subject = `Nuevo pedido #${createdOrder.id}`;
      const text = [
        `Se registro un nuevo pedido (${source === "manual" ? "manual" : "checkout"}).`,
        "",
        `ID: ${createdOrder.id}`,
        `Cliente: ${customerName}`,
        `Direccion: ${address}`,
        `WhatsApp: ${whatsapp}`,
        "",
        "Productos:",
        itemLines,
        "",
        `Subtotal: ${formatCurrency(subtotal)}`,
        `Envio: ${formatCurrency(normalizedShippingCost)}`,
        `Total: ${formatCurrency(total)}`,
      ].join("\n");

      const htmlItems = items
        .map((item) => {
          const variantLabel = item.optionValue || item.size || "Sin variante";
          return `<li>${item.name} x${item.amount} (${variantLabel}) - <strong>${formatCurrency(
            item.price * item.amount
          )}</strong></li>`;
        })
        .join("");

      const html = `
        <p>Se registro un nuevo pedido <strong>(${source === "manual" ? "manual" : "checkout"})</strong>.</p>
        <p><strong>ID:</strong> ${createdOrder.id}</p>
        <p><strong>Cliente:</strong> ${customerName}<br />
        <strong>Direccion:</strong> ${address}<br />
        <strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Productos:</strong></p>
        <ul>${htmlItems}</ul>
        <p>
          <strong>Subtotal:</strong> ${formatCurrency(subtotal)}<br />
          <strong>Envio:</strong> ${formatCurrency(normalizedShippingCost)}<br />
          <strong>Total:</strong> ${formatCurrency(total)}
        </p>
      `;

      try {
        await sendBusinessOrderEmail({
          to: businessEmail,
          subject,
          text,
          html,
        });
      } catch (mailError) {
        console.error("No se pudo enviar email del pedido", mailError);
      }
    }

    return Response.json({
      id: createdOrder.id,
      message: "Pedido guardado correctamente.",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "No se pudo procesar el pedido." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as OrderStatusRequestBody;
    const orderId = toSafeText(body.orderId);

    if (!orderId) {
      return Response.json(
        { error: "El id del pedido es obligatorio." },
        { status: 400 }
      );
    }

    const status = normalizeOrderStatus(body.status);
    const updatedOrder = await updateOrderStatus(orderId, status);

    return Response.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      message: "Estado actualizado correctamente.",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "No se pudo actualizar el estado del pedido." },
      { status: 500 }
    );
  }
}

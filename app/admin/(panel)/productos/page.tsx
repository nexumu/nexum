import Link from "next/link";

import { AdminProductCard } from "@/components/site/admin-product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona tu catálogo y edita los productos publicados.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/productos/nuevo">Agregar un producto</Link>
        </Button>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <AdminProductCard key={product.id} {...product} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            Todavía no hay productos cargados.
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";

import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ProductCard } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/lib/firebase/categories";
import { getFilteredProducts } from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  new?: string;
  featured?: string;
  category?: string;
  subcategory?: string;
};

function isChecked(value?: string) {
  if (!value) return false;
  return value === "1" || value === "true" || value === "on";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const isNew = isChecked(params.new);
  const isFeatured = isChecked(params.featured);
  const category = params.category?.trim() ?? "";
  const subcategory = params.subcategory?.trim() ?? "";

  const [products, categories] = await Promise.all([
    getFilteredProducts({
      queryText: query,
      isNew,
      isFeatured,
      categoryName: category || undefined,
      subcategoryName: subcategory || undefined,
      limitCount: 24,
    }),
    getCategories(),
  ]);

  const selectedCategory = categories.find(
    (categoryOption) => categoryOption.name === category
  );

  const productsLabel = products.length === 1 ? "producto" : "productos";

  const activeFilters = [
    query ? `“${query}”` : null,
    isNew ? "Nuevos" : null,
    isFeatured ? "Destacados" : null,
    category ? category : null,
    subcategory ? subcategory : null,
  ].filter(Boolean) as string[];

  const buildHref = ({
    nextQuery = query,
    nextIsNew = isNew,
    nextIsFeatured = isFeatured,
    nextCategory = category,
    nextSubcategory = subcategory,
  }: {
    nextQuery?: string;
    nextIsNew?: boolean;
    nextIsFeatured?: boolean;
    nextCategory?: string;
    nextSubcategory?: string;
  }) => {
    const params = new URLSearchParams();
    if (nextQuery?.trim()) params.set("q", nextQuery.trim());
    if (nextIsNew) params.set("new", "1");
    if (nextIsFeatured) params.set("featured", "1");
    if (nextCategory?.trim()) params.set("category", nextCategory.trim());
    if (nextSubcategory?.trim()) {
      params.set("subcategory", nextSubcategory.trim());
    }
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Catálogo
          </p>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Resultados de búsqueda
            </h1>
            <p className="text-sm text-muted-foreground">
              {products.length} {productsLabel} encontrados.
            </p>
          </div>
          <form action="/search" method="GET" className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input name="q" placeholder="Buscar por nombre" defaultValue={query} />
            </div>
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="subcategory" value={subcategory} />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="min-w-32">
                Buscar
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/search">Limpiar</Link>
              </Button>
            </div>
            <input type="hidden" name="new" value={isNew ? "1" : ""} />
            <input type="hidden" name="featured" value={isFeatured ? "1" : ""} />
          </form>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Filtros activos:</span>
              {query && (
                <Link
                  href={buildHref({ nextQuery: "" })}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent"
                >
                  {`“${query}”`}
                  <span aria-hidden>×</span>
                </Link>
              )}
              {isNew && (
                <Link
                  href={buildHref({ nextIsNew: false })}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent"
                >
                  Nuevos
                  <span aria-hidden>×</span>
                </Link>
              )}
              {isFeatured && (
                <Link
                  href={buildHref({ nextIsFeatured: false })}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent"
                >
                  Destacados
                  <span aria-hidden>×</span>
                </Link>
              )}
              {category && (
                <Link
                  href={buildHref({ nextCategory: "" })}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent"
                >
                  {category}
                  <span aria-hidden>×</span>
                </Link>
              )}
              {subcategory && (
                <Link
                  href={buildHref({ nextSubcategory: "" })}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent"
                >
                  {subcategory}
                  <span aria-hidden>×</span>
                </Link>
              )}
              <Link
                href="/search"
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                Limpiar todo
              </Link>
            </div>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filtros rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form action="/search" method="GET" className="grid gap-3">
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      name="new"
                      value="1"
                      defaultChecked={isNew}
                      className="size-4 rounded-sm border border-border bg-background text-primary accent-primary"
                    />
                    Nuevos ingresos
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      name="featured"
                      value="1"
                      defaultChecked={isFeatured}
                      className="size-4 rounded-sm border border-border bg-background text-primary accent-primary"
                    />
                    Destacados
                  </label>
                  <Input name="q" defaultValue={query} placeholder="Buscar por nombre" />
                  <label className="grid gap-2 text-sm font-medium">
                    Categoría
                    <select
                      name="category"
                      defaultValue={category}
                      onChange={(event) => {
                        const form = event.currentTarget.form;
                        if (!form) return;
                        const subcategoryField = form.querySelector(
                          "select[name='subcategory']"
                        ) as HTMLSelectElement | null;
                        if (subcategoryField) subcategoryField.value = "";
                      }}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Todas</option>
                      {categories.map((categoryOption) => (
                        <option key={categoryOption.id} value={categoryOption.name}>
                          {categoryOption.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Subcategoría
                    <select
                      name="subcategory"
                      defaultValue={subcategory}
                      disabled={!category}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Todas</option>
                      {selectedCategory?.subcategories.map((subcategoryOption) => (
                        <option key={subcategoryOption.id} value={subcategoryOption.name}>
                          {subcategoryOption.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" className="w-full">
                    Aplicar filtros
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categorías</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((categoryOption) => (
                  <label
                    key={categoryOption.id}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      name="category"
                      value={categoryOption.name}
                      checked={category === categoryOption.name}
                      readOnly
                      className="size-4 rounded-sm border border-border bg-background text-primary accent-primary"
                    />
                    {categoryOption.name}
                  </label>
                ))}
                {selectedCategory?.subcategories?.length ? (
                  <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Subcategorías de {selectedCategory.name}
                    </p>
                    {selectedCategory.subcategories.map((subcategoryOption) => (
                      <label
                        key={subcategoryOption.id}
                        className="flex items-center gap-3 text-xs text-muted-foreground"
                      >
                        <input
                          type="checkbox"
                          name="subcategory"
                          value={subcategoryOption.name}
                          checked={subcategory === subcategoryOption.name}
                          readOnly
                          className="size-3.5 rounded-sm border border-border bg-background text-primary accent-primary"
                        />
                        {subcategoryOption.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Seleccioná la categoría desde los filtros rápidos.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>

          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.length > 0 ? (
              products.map((product) => <ProductCard key={product.id} {...product} />)
            ) : (
              <div className="col-span-full rounded-lg border border-dashed border-border/70 p-8 text-sm text-muted-foreground">
                No hay productos que coincidan con los filtros actuales.
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

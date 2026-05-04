import { Filter, Search, Sparkles, Tag } from "lucide-react";
import Link from "next/link";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { ProductCard } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { getCatalogInfo } from "@/lib/catalog";
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

export default async function CompanySearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ company: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { company: companyRaw } = await params;
  const company = companyRaw.trim().toLowerCase();
  const paramsValue = await searchParams;
  const query = paramsValue.q?.trim() ?? "";
  const isNew = isChecked(paramsValue.new);
  const isFeatured = isChecked(paramsValue.featured);
  const category = paramsValue.category?.trim() ?? "";
  const subcategory = paramsValue.subcategory?.trim() ?? "";
  const searchPath = `/${company}/search`;

  const [products, categories, catalog] = await Promise.all([
    getFilteredProducts({
      queryText: query,
      isNew,
      isFeatured,
      categoryName: category || undefined,
      subcategoryName: subcategory || undefined,
      limitCount: 24,
    }),
    getCategories(),
    getCatalogInfo(company),
  ]);

  const selectedCategory = categories.find(
    (categoryOption) => categoryOption.name === category
  );
  const productsLabel = products.length === 1 ? "producto" : "productos";

  const activeFilters = [
    query ? `"${query}"` : null,
    isNew ? "Nuevos" : null,
    isFeatured ? "Destacados" : null,
    category || null,
    subcategory || null,
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
    const nextParams = new URLSearchParams();
    if (nextQuery?.trim()) nextParams.set("q", nextQuery.trim());
    if (nextIsNew) nextParams.set("new", "1");
    if (nextIsFeatured) nextParams.set("featured", "1");
    if (nextCategory?.trim()) nextParams.set("category", nextCategory.trim());
    if (nextSubcategory?.trim()) nextParams.set("subcategory", nextSubcategory.trim());
    const queryString = nextParams.toString();
    return queryString ? `${searchPath}?${queryString}` : searchPath;
  };

  const filtersPanel = (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Filtros rapidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 sm:pb-5">
          <form action={searchPath} method="GET" className="grid gap-3">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="new" value="1" defaultChecked={isNew} className="size-4 rounded-sm border border-border bg-background text-primary accent-primary" />
              Nuevos ingresos
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="featured" value="1" defaultChecked={isFeatured} className="size-4 rounded-sm border border-border bg-background text-primary accent-primary" />
              Destacados
            </label>
            <Input name="q" defaultValue={query} placeholder="Buscar por nombre" className="border-border/70" />
            <label className="grid gap-2 text-sm font-medium">
              Categoria
              <select name="category" defaultValue={category} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Todas</option>
                {categories.map((categoryOption) => (
                  <option key={categoryOption.id} value={categoryOption.name}>{categoryOption.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Subcategoria
              <select name="subcategory" defaultValue={subcategory} disabled={!category} className="h-10 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">Todas</option>
                {selectedCategory?.subcategories.map((subcategoryOption) => (
                  <option key={subcategoryOption.id} value={subcategoryOption.name}>{subcategoryOption.name}</option>
                ))}
              </select>
            </label>
            <Button type="submit" className="w-full">Aplicar filtros</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 sm:pb-5">
          {categories.map((categoryOption) => (
            <Link
              key={categoryOption.id}
              href={buildHref({ nextCategory: category === categoryOption.name ? "" : categoryOption.name, nextSubcategory: "" })}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition ${category === categoryOption.name ? "border-primary/40 bg-primary/10 text-foreground" : "border-border/70 text-muted-foreground hover:bg-accent"}`}
            >
              {categoryOption.name}
              <span className="text-xs">{category === categoryOption.name ? "Activo" : "Ver"}</span>
            </Link>
          ))}

          {selectedCategory?.subcategories?.length ? (
            <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
              <p className="text-xs font-medium text-muted-foreground">Subcategorias de {selectedCategory.name}</p>
              {selectedCategory.subcategories.map((subcategoryOption) => (
                <Link
                  key={subcategoryOption.id}
                  href={buildHref({ nextCategory: selectedCategory.name, nextSubcategory: subcategory === subcategoryOption.name ? "" : subcategoryOption.name })}
                  className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition ${subcategory === subcategoryOption.name ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground hover:bg-accent"}`}
                >
                  {subcategoryOption.name}
                  {subcategory === subcategoryOption.name ? <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Activa</Badge> : null}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Selecciona una categoria para ver sus subcategorias.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar company={company} catalog={catalog} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-3xl border border-border/70 bg-[linear-gradient(145deg,oklch(0.98_0.008_95)_0%,oklch(0.95_0.018_88)_55%,oklch(0.93_0.03_84)_100%)] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.45_0.04_65)]">
              <Sparkles className="size-3.5" />
              {`Catalogo ${catalog.username}`}
            </p>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Resultados de busqueda
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {products.length} {productsLabel} encontrados
                {query ? (
                  <>
                    {" "}para <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
                  </>
                ) : (
                  "."
                )}
              </p>
            </div>

            <form action={searchPath} method="GET" className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={query}
                  placeholder="Buscar por nombre, categoria o estilo"
                  className="h-11 rounded-full border-border/70 bg-background/85 pl-10"
                />
              </label>
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="subcategory" value={subcategory} />
              <input type="hidden" name="new" value={isNew ? "1" : ""} />
              <input type="hidden" name="featured" value={isFeatured ? "1" : ""} />
              <Button type="submit" className="h-11 min-w-32 rounded-full">
                Buscar
              </Button>
              <Button type="button" variant="outline" asChild className="h-11 rounded-full">
                <Link href={searchPath}>Limpiar</Link>
              </Button>
            </form>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Tag className="size-3.5" />
                  Filtros activos
                </span>
                {query && (
                  <Link href={buildHref({ nextQuery: "" })} className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent">{`"${query}"`}<span aria-hidden>x</span></Link>
                )}
                {isNew && (
                  <Link href={buildHref({ nextIsNew: false })} className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent">Nuevos<span aria-hidden>x</span></Link>
                )}
                {isFeatured && (
                  <Link href={buildHref({ nextIsFeatured: false })} className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent">Destacados<span aria-hidden>x</span></Link>
                )}
                {category && (
                  <Link href={buildHref({ nextCategory: "" })} className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent">{category}<span aria-hidden>x</span></Link>
                )}
                {subcategory && (
                  <Link href={buildHref({ nextSubcategory: "" })} className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent">{subcategory}<span aria-hidden>x</span></Link>
                )}
                <Link href={searchPath} className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">Limpiar todo</Link>
              </div>
            )}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block lg:self-start xl:sticky xl:-top-10 2xl:top-32 xl:self-start">
            {filtersPanel}
          </aside>

          <section>
            <div className="mb-4 lg:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button type="button" variant="outline" className="w-full rounded-full">
                    <Filter className="size-4" />
                    Abrir filtros
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85dvh]">
                  <DrawerHeader>
                    <DrawerTitle>Filtros</DrawerTitle>
                    <DrawerDescription>
                      Ajusta la busqueda por categoria, subcategoria y tipo de producto.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="overflow-y-auto px-4 pb-6">
                    {filtersPanel}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{products.length}</span> {productsLabel}
              </p>
              {query ? (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                  Busqueda: {query}
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} {...product} company={company} />
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-border/70 bg-card/60 p-10 text-sm text-muted-foreground">
                  No hay productos que coincidan con los filtros actuales.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer company={company} catalog={catalog} />
    </div>
  );
}

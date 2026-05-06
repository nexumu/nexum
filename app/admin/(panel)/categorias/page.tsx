"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

type Subcategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
};

const categoriesCollection = collection(db, "categories");

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deleteSubcategoryDialogOpen, setDeleteSubcategoryDialogOpen] =
    useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubcategory, setActiveSubcategory] =
    useState<Subcategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        subcategories: [...(category.subcategories ?? [])].sort(
          (a, b) => a.createdAt - b.createdAt
        ),
      })),
    [categories]
  );

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(
        query(categoriesCollection, orderBy("createdAt", "desc"))
      );
      const data = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data() as Category;
        return {
          id: docSnap.id,
          name: docData.name,
          slug: docData.slug,
          subcategories: docData.subcategories ?? [],
        };
      });
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    const name = categoryName.trim();
    if (!name) return;
    setError(null);
    try {
      await addDoc(categoriesCollection, {
        name,
        slug: slugify(name),
        createdAt: serverTimestamp(),
        subcategories: [],
      });
      setCategoryName("");
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear la categoría.");
    }
  };

  const openSubcategoryDialog = (category: Category) => {
    setActiveCategory(category);
    setSubcategoryName("");
    setSubcategoryDialogOpen(true);
  };

  const openDeleteCategoryDialog = (category: Category) => {
    setActiveCategory(category);
    setDeleteCategoryDialogOpen(true);
  };

  const openDeleteSubcategoryDialog = (
    category: Category,
    subcategory: Subcategory
  ) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    setDeleteSubcategoryDialogOpen(true);
  };

  const handleCreateSubcategory = async () => {
    const name = subcategoryName.trim();
    if (!name || !activeCategory) return;
    setError(null);
    try {
      const subcategory: Subcategory = {
        id: crypto.randomUUID(),
        name,
        slug: slugify(name),
        createdAt: Date.now(),
      };
      await updateDoc(doc(categoriesCollection, activeCategory.id), {
        subcategories: arrayUnion(subcategory),
      });
      setSubcategoryDialogOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear la subcategoría.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!activeCategory) return;
    setError(null);
    try {
      await deleteDoc(doc(categoriesCollection, activeCategory.id));
      setDeleteCategoryDialogOpen(false);
      setActiveCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la categoría.");
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!activeCategory || !activeSubcategory) return;
    setError(null);
    try {
      const nextSubcategories = (activeCategory.subcategories ?? []).filter(
        (subcategory) => subcategory.id !== activeSubcategory.id
      );
      await updateDoc(doc(categoriesCollection, activeCategory.id), {
        subcategories: nextSubcategories,
      });
      setDeleteSubcategoryDialogOpen(false);
      setActiveSubcategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la subcategoría.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Organizá el catálogo con categorías y subcategorías.
          </p>
        </div>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agregar categoría</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva categoría</DialogTitle>
              <DialogDescription>
                Creá una nueva categoría para tus productos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="text-sm font-medium">
                Nombre
                <Input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Abrigos"
                />
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreateCategory}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando categorías...</p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          {sortedCategories.length > 0 ? (
            sortedCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {category.slug}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openSubcategoryDialog(category)}
                    >
                      Agregar subcategoría
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => openDeleteCategoryDialog(category)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {category.subcategories.map((subcategory) => (
                        <li
                          key={subcategory.id}
                          className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {subcategory.name}
                            </p>
                            <p className="truncate text-xs">{subcategory.slug}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              openDeleteSubcategoryDialog(category, subcategory)
                            }
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Todavía no hay subcategorías.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              Todavía no hay categorías creadas.
            </div>
          )}
        </section>
      )}

      <Dialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva subcategoría</DialogTitle>
            <DialogDescription>
              Se agregará dentro de {activeCategory?.name ?? "la categoría"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="text-sm font-medium">
              Nombre
              <Input
                value={subcategoryName}
                onChange={(event) => setSubcategoryName(event.target.value)}
                placeholder="Abrigos livianos"
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubcategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateSubcategory}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la categoría
              {activeCategory?.name ? ` "${activeCategory.name}"` : ""} y sus
              subcategorías.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCategory}
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteSubcategoryDialogOpen}
        onOpenChange={setDeleteSubcategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar subcategoría</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la subcategoría
              {activeSubcategory?.name
                ? ` "${activeSubcategory.name}"`
                : ""}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteSubcategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubcategory}
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

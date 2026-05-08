"use client";

import Link from "next/link";
import { LogOut, Menu, Package, Tags, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAdminAuth } from "@/app/admin/admin-auth";

export const navItems = [
  {
    label: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
    icon: Tags,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: Truck,
  },
];

export function AdminSidebar() {
  const { logout } = useAdminAuth();

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Admin
          </p>
          <h2 className="text-lg font-semibold">Panel</h2>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Panel</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SheetClose key={item.label} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground transition group-hover:text-accent-foreground" />
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <SheetClose asChild>
              <Button
                type="button"
                variant="destructive"
                onClick={logout}
                className="mt-auto justify-start gap-3"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-card px-4 py-6 lg:flex">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Admin
          </p>
          <h2 className="text-xl font-semibold">Panel</h2>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground transition group-hover:text-accent-foreground" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          type="button"
          variant="destructive"
          onClick={logout}
          className="mt-auto justify-start gap-3"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </aside>
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Menu, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type CartItem,
  getCart,
  removeFromCart,
  setCartItemAmount,
} from "@/lib/cart";
import { Input } from "@/components/ui/input";

const links = [
  { href: "#new", label: "New Arrivals" },
  { href: "#featured", label: "Featured" },
  { href: "#collections", label: "Collections" },
  { href: "#sale", label: "Sale" },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function Navbar() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const syncCart = () => {
      setCartItems(getCart());
    };
    const openCart = () => {
      setCartOpen(true);
    };

    syncCart();
    window.addEventListener("cart:updated", syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener("cart:open", openCart);

    return () => {
      window.removeEventListener("cart:updated", syncCart);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cart:open", openCart);
    };
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.amount, 0),
    [cartItems]
  );
  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.amount, 0),
    [cartItems]
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-semibold tracking-[0.18em] uppercase text-foreground"
        >
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            E
          </span>
          Epicom
        </Link>

        <NavigationMenu viewport={false} className="hidden md:flex">
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link href={link.href}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <form
            action="/search"
            method="GET"
            className="hidden w-full max-w-sm items-center gap-2 md:flex"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar productos"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>

          <Drawer
            direction="right"
            open={cartOpen}
            onOpenChange={setCartOpen}
          >
            <DrawerTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Open cart">
                <span className="relative">
                  <ShoppingCart className="size-4" />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="flex h-full max-h-full flex-col">
              <DrawerHeader>
                <DrawerTitle>Tu carrito</DrawerTitle>
                <DrawerDescription>
                  Revisa los productos antes de confirmar.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex-1 overflow-auto px-4 pb-4">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todavia no agregaste productos.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.id}-${item.size}`}
                        className="flex flex-col gap-2 border-b border-border/60 pb-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Talle: {item.size || "Sin talle"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground"
                            aria-label="Remove item"
                            onClick={() => removeFromCart(item.id, item.size)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1 rounded-full border border-border/60">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              aria-label="Decrease quantity"
                              disabled={item.amount <= 1}
                              onClick={() =>
                                setCartItemAmount(
                                  item.id,
                                  item.size,
                                  item.amount - 1
                                )
                              }
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="min-w-6 text-center text-xs font-semibold">
                              {item.amount}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              aria-label="Increase quantity"
                              onClick={() =>
                                setCartItemAmount(
                                  item.id,
                                  item.size,
                                  item.amount + 1
                                )
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} x {item.amount}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatPrice(item.price * item.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DrawerFooter>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <Button type="button">Confirm</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="hidden items-center gap-2 md:flex">
            <Button>Sign in</Button>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button size="icon" variant="outline" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%]">
              <SheetHeader className="mb-6">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Browse categories and featured drops.
                </SheetDescription>
              </SheetHeader>
              <form action="/search" method="GET" className="mb-6 flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Buscar productos"
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="outline">
                  Buscar
                </Button>
              </form>
              <nav className="flex flex-col gap-3">
                {links.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </nav>
              <div className="mt-8 grid gap-3">
                <Button>Sign in</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

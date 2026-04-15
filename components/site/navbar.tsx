"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

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
import { cn } from "@/lib/utils";

const links = [
  { href: "#new", label: "Recien llegados" },
  { href: "#featured", label: "Elegidos Nexum" },
  { href: "#faq", label: "FAQ" },
];

const announcementMessages = [
  "Envios a todo el pais",
];

const optionTypeLabel: Record<NonNullable<CartItem["optionType"]>, string> = {
  talle: "Talle",
  color: "Color",
  tamano: "Tamano",
  material: "Material",
  otro: "Variante",
};

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
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const timerId = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 140);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAnnouncementIndex((current) =>
        current === announcementMessages.length - 1 ? 0 : current + 1
      );
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
  const hasCartItems = cartItems.length > 0;

  const showPreviousAnnouncement = () => {
    setAnnouncementIndex((current) =>
      current === 0 ? announcementMessages.length - 1 : current - 1
    );
  };

  const showNextAnnouncement = () => {
    setAnnouncementIndex((current) =>
      current === announcementMessages.length - 1 ? 0 : current + 1
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-primary/25 bg-[oklch(0.95_0.025_82)] text-foreground shadow-[0_8px_30px_-18px_oklch(0.58_0.05_55)]">
      <div className="border-b border-primary/20 bg-[oklch(0.9_0.04_94)] text-[oklch(0.39_0.033_52)]">
        <div className="flex h-11 w-full items-center justify-between gap-2 px-2 sm:px-5 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[oklch(0.39_0.033_52)] hover:bg-primary/15 hover:text-[oklch(0.33_0.026_52)]"
            onClick={showPreviousAnnouncement}
            aria-label="Mensaje anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="truncate text-center text-[11px] font-semibold tracking-[0.08em] uppercase sm:text-xs">
            {announcementMessages[announcementIndex]}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[oklch(0.39_0.033_52)] hover:bg-primary/15 hover:text-[oklch(0.33_0.026_52)]"
            onClick={showNextAnnouncement}
            aria-label="Siguiente mensaje"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative h-20 w-full overflow-hidden bg-[linear-gradient(90deg,oklch(0.96_0.018_84)_0%,oklch(0.93_0.024_78)_52%,oklch(0.91_0.033_90)_100%)]">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4 sm:px-6 lg:px-10 transition-all duration-300",
            isSearchOpen
              ? "pointer-events-none -translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          )}
        >
          <Link
            href="/"
            className="inline-flex items-center mr-4 gap-2 rounded-md px-1 py-1 text-sm font-semibold tracking-[0.18em] uppercase text-foreground"
          >
            Nexum
          </Link>

          <NavigationMenu viewport={false} className="hidden md:flex">
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className="rounded-full px-4 py-2 text-foreground/90 hover:bg-primary/12 hover:text-foreground"
                  >
                    <Link href={link.href} className="text-[13px] tracking-[0.08em] uppercase">
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
            <Button
              size="icon"
              variant="outline"
              aria-label="Abrir buscador"
              className="border-primary/35 bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="size-4" />
            </Button>

            {!isSearchOpen && (
              <>
                <Drawer
                  direction="right"
                  open={cartOpen}
                  onOpenChange={setCartOpen}
                >
                  <DrawerTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Open cart"
                      className="border-primary/35 bg-primary/10 text-primary hover:bg-primary/20"
                    >
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
                        Revisa tus productos antes de finalizar la compra.
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 overflow-auto px-4 pb-4">
                      {!hasCartItems ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Todavia no agregaste productos.
                          </p>
                          <Button asChild type="button" className="w-full">
                            <Link href="#new" onClick={() => setCartOpen(false)}>
                              Explorar productos
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {cartItems.map((item) => {
                            const label = item.optionType
                              ? optionTypeLabel[item.optionType]
                              : "Talle";
                            const value = item.optionValue || item.size || "Sin opcion";
                            const identity = `${item.id}-${item.optionType ?? "talle"}-${value}`;

                            return (
                              <div
                                key={identity}
                                className="flex flex-col gap-2 border-b border-border/60 pb-3"
                              >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {label}: {value}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground"
                                  aria-label="Remove item"
                                  onClick={() =>
                                    removeFromCart(
                                      item.id,
                                      item.size,
                                      item.optionType,
                                      item.optionValue
                                    )
                                  }
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
                                        item.amount - 1,
                                        item.optionType,
                                        item.optionValue
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
                                        item.amount + 1,
                                        item.optionType,
                                        item.optionValue
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
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <DrawerFooter>
                      {hasCartItems ? (
                        <>
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span>Total</span>
                            <span>{formatPrice(cartTotal)}</span>
                          </div>
                          <Button type="button">Finalizar pedido</Button>
                        </>
                      ) : (
                        <Button asChild type="button" variant="outline">
                          <Link href="#new" onClick={() => setCartOpen(false)}>
                            Explorar
                          </Link>
                        </Button>
                      )}
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Open menu"
                      className="border-primary/35 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <Menu className="size-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%]">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Menu</SheetTitle>
                      <SheetDescription>
                        Explora productos y seleccionados de la tienda.
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
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center px-4 sm:px-6 lg:px-10 transition-all duration-300",
            isSearchOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          )}
        >
          <form action="/search" method="GET" className="flex w-full items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar buscador"
              className="text-primary hover:bg-primary/12 hover:text-primary"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="size-4" />
            </Button>

            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                name="q"
                placeholder="Buscar productos, colecciones y mas"
                className="h-11 rounded-full border-primary/35 bg-background/85 pr-12 pl-4 text-foreground placeholder:text-muted-foreground"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchOpen(false);
                  }
                }}
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-95"
              >
                <Search className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}

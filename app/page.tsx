import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,oklch(0.95_0.03_220)_0%,transparent_44%),radial-gradient(circle_at_80%_0%,oklch(0.94_0.03_140)_0%,transparent_42%),oklch(0.99_0.004_95)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[oklch(0.36_0.03_230)]">
            Sendostock
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="https://www.sendostock.com/" target="_blank" rel="noreferrer">
              Crear mi catalogo
            </Link>
          </Button>
        </header>

        <section className="mt-18 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-[0_30px_90px_-48px_oklch(0.31_0.04_225)] backdrop-blur sm:p-12 lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Tu catalogo en minutos
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl leading-tight font-semibold text-foreground sm:text-5xl lg:text-6xl">
            Convierte tu negocio en un catalogo online compartible por link.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sube tus productos, personaliza tu marca y empieza a vender por WhatsApp sin
            complicaciones tecnicas.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="https://www.sendostock.com/" target="_blank" rel="noreferrer">
                Quiero mi catalogo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="https://www.sendostock.com/" target="_blank" rel="noreferrer">
                Ver mas informacion
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

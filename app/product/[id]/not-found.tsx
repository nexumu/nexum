import Link from "next/link";

import { Navbar } from "@/components/site/navbar";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-24 sm:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-border/60 bg-card p-8 text-center shadow-sm sm:p-12">
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Pagina no encontrada
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            La pagina que intentas abrir no existe o fue removida. Puedes volver al inicio.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

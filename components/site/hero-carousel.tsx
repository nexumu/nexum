"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
  {
    image: "/hero1.jpg",
    eyebrow: "Coleccion hogar",
    title: "Detalles calidos para cada mesa",
    description:
      "Vasos, termitos y accesorios para disfrutar tus bebidas favoritas con estilo simple y funcional.",
  },
  {
    image: "/hero2.jpg",
    eyebrow: "Nuevos ingresos",
    title: "Termos y termitos para la rutina diaria",
    description:
      "Diseno durable y acabados neutros para acompanarte en la oficina, en casa o en movimiento.",
  },
  {
    image: "/hero3.jpg",
    eyebrow: "Selecciones Nexum",
    title: "Regalos utiles con estetica de hogar",
    description:
      "Encuentra piezas practicas para regalar o renovar tus espacios cotidianos.",
  },
];

export function HeroCarousel() {
  return (
    <section className="w-full">
      <Carousel
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
        className="group"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <div className="relative min-h-[calc(100vh-7.75rem)] overflow-hidden border-b border-border/30 bg-card text-card-foreground">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-linear-to-r from-[oklch(0.26_0.03_45/0.84)] via-[oklch(0.26_0.03_45/0.54)] to-transparent" />
                <div className="relative flex min-h-[calc(100vh-7.75rem)] max-w-xl flex-col justify-center gap-4 px-6 py-10 text-[oklch(0.98_0.004_95)] sm:px-12">
                  <p className="text-xs font-semibold tracking-[0.24em] uppercase text-[oklch(0.91_0.012_88)]">
                    {slide.eyebrow}
                  </p>
                  <h1 className="text-balance text-4xl leading-tight font-semibold sm:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="max-w-lg text-sm leading-relaxed text-[oklch(0.92_0.01_84)] sm:text-base">
                    {slide.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href="#new">Ver productos</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                    >
                      <Link href="#featured">Elegidos Nexum</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 border-white/40 bg-black/30 text-white hover:bg-black/50 disabled:opacity-30" />
        <CarouselNext className="right-4 border-white/40 bg-black/30 text-white hover:bg-black/50 disabled:opacity-30" />
      </Carousel>
    </section>
  );
}

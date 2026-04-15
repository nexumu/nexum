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
    image: "/hero-1.svg",
    eyebrow: "Spring 2026",
    title: "Minimal Pieces, Maximum Impact",
    description:
      "Fresh silhouettes and premium textures designed to make everyday outfits feel curated.",
  },
  {
    image: "/hero-2.svg",
    eyebrow: "Editor Picks",
    title: "Weekend Looks That Move With You",
    description:
      "Performance-ready fabric blends and timeless layers for city breaks and road trips.",
  },
  {
    image: "/hero-3.svg",
    eyebrow: "Member Drop",
    title: "Limited Essentials. Restock Unlikely.",
    description:
      "Shop early access to small-batch staples before they disappear from the storefront.",
  },
];

export function HeroCarousel() {
  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <div className="relative min-h-[460px] overflow-hidden rounded-3xl border border-border/50 bg-card text-card-foreground shadow-xl sm:min-h-[520px]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10" />
                <div className="relative flex min-h-[460px] max-w-xl flex-col justify-center gap-4 px-6 py-10 text-white sm:min-h-[520px] sm:px-12">
                  <p className="text-xs font-semibold tracking-[0.24em] uppercase text-stone-200">
                    {slide.eyebrow}
                  </p>
                  <h1 className="text-balance text-4xl leading-tight font-semibold sm:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="max-w-lg text-sm leading-relaxed text-stone-200 sm:text-base">
                    {slide.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href="#collections">Shop collection</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                    >
                      <Link href="#featured">View featured</Link>
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

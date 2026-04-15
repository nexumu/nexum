import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type CollectionHighlightSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  href: string;
  align?: "left" | "right";
};

export function CollectionHighlightSection({
  id,
  eyebrow,
  title,
  description,
  image,
  href,
  align = "left",
}: CollectionHighlightSectionProps) {
  return (
    <section id={id} className="mt-16 w-full px-4 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-3xl border border-border/50 shadow-sm">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.23_0.03_45_/_0.82)_0%,oklch(0.23_0.03_45_/_0.52)_44%,oklch(0.23_0.03_45_/_0.25)_66%,transparent_100%)]" />
        </div>

        <div
          className={`relative z-10 flex min-h-[360px] items-center px-6 py-10 sm:min-h-[420px] sm:px-10 lg:px-16 ${
            align === "right" ? "justify-end text-right" : "justify-start text-left"
          }`}
        >
          <div className="max-w-xl text-white">
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/80">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              {description}
            </p>
            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="bg-white text-[oklch(0.3_0.03_48)] hover:bg-white/90"
              >
                <Link href={href}>Ver coleccion</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

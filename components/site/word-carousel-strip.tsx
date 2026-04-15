const words = [
  "calidez",
  "ritual",
  "diseno",
  "hogar",
  "regalo",
  "pausa",
  "mesa",
  "momento",
  "textura",
  "bienestar",
];

export function WordCarouselStrip() {
  const loopWords = [...words, ...words];

  return (
    <section className="mt-8 w-full px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-[oklch(0.95_0.018_83)] py-4">
        <div className="word-marquee-track flex w-max items-center gap-3 px-2">
          {loopWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="rounded-full border border-primary/20 bg-background/75 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-primary"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

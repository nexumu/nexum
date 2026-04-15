const phrases = [
  "Diseno funcional para disfrutar cada pausa del dia",
  "Termos y accesorios que convierten la rutina en ritual",
  "Piezas para regalar, compartir y disfrutar en casa",
  "Calidad pensada para acompanarte dentro y fuera del hogar",
  "Detalles que suman calidez a tus momentos cotidianos",
];

export function WordCarouselStrip() {
  const loopPhrases = [...phrases, ...phrases, ...phrases];

  return (
    <section className="mt-8 w-full px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-[oklch(0.95_0.018_83)] py-5">
        <div className="word-marquee-rail">
          {[0, 1].map((copyIndex) => (
            <div
              key={copyIndex}
              className="word-marquee-group"
              aria-hidden={copyIndex === 1}
            >
              {loopPhrases.map((phrase, index) => (
                <span
                  key={`${copyIndex}-${phrase}-${index}`}
                  className="rounded-full border border-primary/20 bg-background/80 px-5 py-2 text-sm font-semibold tracking-[0.04em] text-primary sm:px-6 sm:py-2.5 sm:text-base"
                >
                  {phrase}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

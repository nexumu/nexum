import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Cuanto tarda el envio?",
    answer:
      "Los envios nacionales demoran entre 24 y 72 horas habiles segun la ciudad. Al confirmar la compra recibes tracking por email.",
  },
  {
    question: "Puedo cambiar el talle si no me queda bien?",
    answer:
      "Si. Puedes solicitar cambio dentro de los primeros 15 dias desde la entrega, siempre que la prenda este en perfecto estado.",
  },
  {
    question: "Que medios de pago aceptan?",
    answer:
      "Aceptamos tarjetas de credito y debito, transferencias y billeteras digitales. Tambien puedes pagar en cuotas segun promociones vigentes.",
  },
  {
    question: "Los descuentos del sitio se acumulan?",
    answer:
      "Depende de la promocion. En cada producto indicamos si el descuento es acumulable con cupones o beneficios de temporada.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium tracking-[0.22em] uppercase text-muted-foreground">
          FAQ
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Preguntas Frecuentes</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Respuestas rapidas a las dudas mas comunes antes de comprar.
        </p>

        <Accordion type="single" collapsible className="mt-6">
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

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
      "Los envios nacionales demoran entre 24 y 72 horas habiles segun la ciudad. Al confirmar la compra recibes seguimiento por email o WhatsApp.",
  },
  {
    question: "Puedo cambiar un producto si no era lo que esperaba?",
    answer:
      "Si. Puedes solicitar cambio dentro de los primeros 15 dias desde la entrega, siempre que el producto este sin uso y en su empaque original.",
  },
  {
    question: "Que medios de pago aceptan?",
    answer:
      "Aceptamos tarjetas de credito y debito, transferencias y billeteras digitales. Tambien puedes pagar en cuotas segun promociones vigentes.",
  },
  {
    question: "Como cuido mis termos y vasos termicos?",
    answer:
      "Recomendamos lavado a mano con agua tibia y no usar abrasivos. En cada ficha de producto vas a encontrar cuidados y recomendaciones de uso.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mt-16 w-full px-4 sm:px-6 lg:px-8">
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

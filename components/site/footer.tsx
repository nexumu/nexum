import Link from "next/link";

const shopLinks = [
  { href: "#new", label: "Recien llegados" },
  { href: "#featured", label: "Elegidos Nexum" },
  { href: "#faq", label: "Preguntas frecuentes" },
];

const companyLinks = [
  { href: "#", label: "Nuestra historia" },
  { href: "#", label: "Contacto" },
  { href: "#", label: "Puntos de venta" },
  { href: "#", label: "Mayoristas" },
];

const supportLinks = [
  { href: "#", label: "Envios" },
  { href: "#", label: "Cambios" },
  { href: "#", label: "Seguimiento" },
  { href: "#", label: "Ayuda" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card">
      <div className="grid w-full gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase"
          >
            <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
              N
            </span>
            Nexum
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Diseno cotidiano para vasos, termos y accesorios que hacen mas calidos
            los momentos de todos los dias.
          </p>
          <div className="mt-5 text-xs text-muted-foreground">
            Compra segura · Envio rapido · Cambios simples
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Tienda</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Marca</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Soporte</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="flex w-full flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Nexum. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-foreground">
              Politica de privacidad
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terminos y condiciones
            </Link>
            <Link href="#" className="hover:text-foreground">
              Medios de pago
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

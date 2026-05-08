import Link from "next/link";
import Image from "next/image";

const shopLinks = [
  { href: "#new", label: "Recien llegados" },
  { href: "#featured", label: "Elegidos Nexum" },
  { href: "#faq", label: "Preguntas frecuentes" },
];

type FooterProps = {
  company?: string;
};

export function Footer({ company }: FooterProps) {
  const basePath = company ? `/${company}` : "";
  const homePath = basePath || "/";

  return (
    <footer className="mt-auto flex flex-col border-t border-border/70 bg-card">
      <div className="grid w-full gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <div>
          <Link
            href={homePath}
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase"
          >
            <Image src="/logo.png" alt="Nexum" width={100} height={32} className="h-16 w-auto object-contain" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">

            Diseno cotidiano para vasos, termos y accesorios que hacen mas calidos los momentos de todos los dias.
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
                <Link href={`${homePath}${link.href}`} className="transition hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:block" />
      </div>

      <div className="border-t border-border/70">
        <div className="text-center w-full gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Nexum. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

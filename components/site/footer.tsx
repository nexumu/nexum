import Link from "next/link";

const shopLinks = [
  { href: "#new", label: "New Arrivals" },
  { href: "#featured", label: "Featured" },
  { href: "#collections", label: "Collections" },
  { href: "#sale", label: "Sale" },
];

const companyLinks = [
  { href: "#", label: "About Us" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Affiliates" },
];

const supportLinks = [
  { href: "#", label: "Shipping" },
  { href: "#", label: "Returns" },
  { href: "#", label: "Order Tracking" },
  { href: "#", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase"
          >
            <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
              E
            </span>
            Epicom
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Curated essentials for modern wardrobes. Built for speed, comfort, and
            effortless style.
          </p>
          <div className="mt-5 text-xs text-muted-foreground">
            Secure checkout · Fast shipping · Easy returns
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Shop</h3>
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
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Company</h3>
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
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Support</h3>
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Epicom. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground">
              Payment Methods
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { RouteScrollReset } from "@/components/site/route-scroll-reset";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexum | Hogar y bebidas",
  description:
    "Tienda Nexum de vasos, termitos, termos y accesorios para el hogar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="es"
        className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
      >
      <body className="min-h-screen flex flex-col">
        <RouteScrollReset />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}

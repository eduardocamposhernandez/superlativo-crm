import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProveedorTema } from "@/components/proveedor-tema";
import { ProveedorToast } from "@/components/ui/toast";
import { ProveedorConfirmar } from "@/components/ui/confirmar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SUPERLATIVO — Tu CRM para vender más",
    template: "%s · SUPERLATIVO",
  },
  description:
    "CRM hecho a la medida de SUPERLATIVO: agenda citas, no dejes caer a ningún cliente y cierra más ventas cada mes.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "SUPERLATIVO — Acompañamiento para tomar mejores decisiones",
    description:
      "Mentoría, conferencias y procesos de claridad personal para jóvenes, adultos e instituciones.",
    type: "website",
    locale: "es_MX",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3fbf8f" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Script de aplicar tema ANTES del primer pintado (evita parpadeo)
const scriptTema = `
(function(){try{
  var p = localStorage.getItem('superlativo-tema') || 'auto';
  var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var oscuro = p === 'oscuro' || (p === 'auto' && m);
  if(oscuro) document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <ProveedorTema>
          <ProveedorToast>
            <ProveedorConfirmar>{children}</ProveedorConfirmar>
          </ProveedorToast>
        </ProveedorTema>
      </body>
    </html>
  );
}

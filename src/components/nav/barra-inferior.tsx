"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  ListChecks,
  Menu,
} from "lucide-react";

const ITEMS = [
  { href: "/tablero", etiqueta: "Tablero", Icono: LayoutDashboard },
  { href: "/clientes", etiqueta: "Clientes", Icono: Users },
  { href: "/embudo", etiqueta: "Embudo", Icono: KanbanSquare },
  { href: "/seguimiento", etiqueta: "Hoy", Icono: ListChecks },
];

export function BarraInferior({ onAbrirMas }: { onAbrirMas: () => void }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-borde bg-superficie-alta/95 backdrop-blur lg:hidden"
    >
      {ITEMS.map(({ href, etiqueta, Icono }) => {
        const activo = pathname === href || pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              activo ? "text-marca-600" : "text-texto-suave"
            }`}
          >
            <Icono className="h-5 w-5" aria-hidden />
            {etiqueta}
          </Link>
        );
      })}
      <button
        onClick={onAbrirMas}
        className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-texto-suave"
      >
        <Menu className="h-5 w-5" aria-hidden />
        Más
      </button>
    </nav>
  );
}

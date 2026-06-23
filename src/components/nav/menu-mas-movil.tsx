"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Wallet,
  Trophy,
  XCircle,
  Archive,
  Link as LinkIco,
  UserCog,
  Share2,
  Sparkles,
  ShieldCheck,
  Settings,
  HelpCircle,
  X,
  type LucideIcon,
} from "lucide-react";

interface ItemMas {
  href: string;
  etiqueta: string;
  Icono: LucideIcon;
  soloAdmin?: boolean;
}

const ITEMS: ItemMas[] = [
  { href: "/agenda", etiqueta: "Agenda", Icono: CalendarDays },
  { href: "/pagos", etiqueta: "Pagos", Icono: Wallet },
  { href: "/completados", etiqueta: "Completados", Icono: Trophy },
  { href: "/perdidos", etiqueta: "Perdidos", Icono: XCircle },
  { href: "/archivados", etiqueta: "Archivados", Icono: Archive },
  { href: "/paginas-agenda", etiqueta: "Páginas de agenda", Icono: LinkIco },
  { href: "/equipo", etiqueta: "Equipo", Icono: UserCog, soloAdmin: true },
  { href: "/comparte", etiqueta: "Comparte y crece", Icono: Share2 },
  { href: "/plantillas", etiqueta: "Mis plantillas", Icono: Sparkles },
  { href: "/admin", etiqueta: "Panel admin", Icono: ShieldCheck, soloAdmin: true },
  { href: "/configuracion", etiqueta: "Configuración", Icono: Settings },
  { href: "/perfil", etiqueta: "Mi perfil", Icono: HelpCircle },
];

export function MenuMasMovil({
  abierto,
  alCerrar,
  rol,
}: {
  abierto: boolean;
  alCerrar: () => void;
  rol: string;
}) {
  if (!abierto || typeof window === "undefined") return null;
  const items = ITEMS.filter((i) => !i.soloAdmin || rol === "ADMIN");
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end lg:hidden" role="dialog" aria-label="Más opciones">
      <div className="absolute inset-0 bg-black/40" onClick={alCerrar} aria-hidden />
      <div className="relative w-full rounded-t-3xl bg-superficie-alta p-4 pb-24 animate-aparecer">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-texto">Más opciones</h3>
          <button onClick={alCerrar} aria-label="Cerrar" className="rounded-lg p-1 text-texto-suave">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map(({ href, etiqueta, Icono }) => (
            <Link
              key={href}
              href={href}
              onClick={alCerrar}
              className="flex flex-col items-center gap-2 rounded-xl border border-borde p-3 text-center text-xs font-medium text-texto hover:bg-superficie"
            >
              <Icono className="h-5 w-5 text-marca-600" aria-hidden />
              {etiqueta}
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

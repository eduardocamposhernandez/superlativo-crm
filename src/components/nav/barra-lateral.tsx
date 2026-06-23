"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CalendarDays,
  Wallet,
  ListChecks,
  Trophy,
  XCircle,
  Archive,
  Link as LinkIco,
  UserCog,
  Share2,
  Sparkles,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@/lib/permisos";

interface ItemMenu {
  href: string;
  etiqueta: string;
  Icono: LucideIcon;
  matiz: string;
  soloAdmin?: boolean;
}

const ITEMS: ItemMenu[] = [
  { href: "/tablero", etiqueta: "Tablero", Icono: LayoutDashboard, matiz: "text-marca-600" },
  { href: "/clientes", etiqueta: "Clientes", Icono: Users, matiz: "text-sky-600" },
  { href: "/embudo", etiqueta: "Embudo", Icono: KanbanSquare, matiz: "text-indigo-600" },
  { href: "/agenda", etiqueta: "Agenda", Icono: CalendarDays, matiz: "text-green-600" },
  { href: "/pagos", etiqueta: "Pagos", Icono: Wallet, matiz: "text-emerald-600" },
  { href: "/seguimiento", etiqueta: "Hoy te toca", Icono: ListChecks, matiz: "text-amber-600" },
  { href: "/completados", etiqueta: "Completados", Icono: Trophy, matiz: "text-green-600" },
  { href: "/perdidos", etiqueta: "Perdidos", Icono: XCircle, matiz: "text-gray-500" },
  { href: "/archivados", etiqueta: "Archivados", Icono: Archive, matiz: "text-stone-500" },
  { href: "/paginas-agenda", etiqueta: "Páginas de agenda", Icono: LinkIco, matiz: "text-teal-600" },
  { href: "/equipo", etiqueta: "Equipo", Icono: UserCog, matiz: "text-cyan-600", soloAdmin: true },
  { href: "/comparte", etiqueta: "Comparte y crece", Icono: Share2, matiz: "text-marca-600" },
  { href: "/plantillas", etiqueta: "Mis plantillas", Icono: Sparkles, matiz: "text-marca-600" },
  { href: "/admin", etiqueta: "Panel admin", Icono: ShieldCheck, matiz: "text-marca-600", soloAdmin: true },
  { href: "/configuracion", etiqueta: "Configuración", Icono: Settings, matiz: "text-texto-suave" },
];

export function BarraLateral({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => !i.soloAdmin || rol === "ADMIN");

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-borde lg:bg-superficie-alta">
      <div className="flex h-16 items-center gap-2 border-b border-borde px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-marca-500 text-white shadow-marca">
          <span className="text-sm font-bold">S</span>
        </div>
        <div>
          <p className="text-sm font-bold text-texto">SUPERLATIVO</p>
          <p className="text-[11px] text-texto-tenue">León, GTO</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Navegación principal">
        <ul className="space-y-0.5 px-2">
          {items.map(({ href, etiqueta, Icono, matiz }) => {
            const activo =
              pathname === href || (href !== "/tablero" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    activo
                      ? "bg-marca-50 text-marca-700 dark:bg-marca-500/10 dark:text-marca-300"
                      : "text-texto hover:bg-superficie"
                  }`}
                  aria-current={activo ? "page" : undefined}
                >
                  <Icono className={`h-5 w-5 ${activo ? matiz : "text-texto-suave"}`} aria-hidden />
                  <span>{etiqueta}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

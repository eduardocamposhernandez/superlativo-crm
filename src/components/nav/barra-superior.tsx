"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, HelpCircle, Bell, LogOut, User as UserIcon } from "lucide-react";
import { SelectorTema } from "@/components/ui/selector-tema";
import { Buscador } from "@/components/nav/buscador";
import { LanzadorTutorial } from "@/components/onboarding/tour";
import { iniciales } from "@/lib/formato";

interface Props {
  usuario: { nombre: string; correo: string; rol: string };
}

export function BarraSuperior({ usuario }: Props) {
  const router = useRouter();
  const [abrirBuscador, setAbrirBuscador] = useState(false);
  const [abrirAyuda, setAbrirAyuda] = useState(false);
  const [abrirPerfil, setAbrirPerfil] = useState(false);

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-borde bg-superficie-alta/85 px-3 backdrop-blur sm:px-5">
      <button
        type="button"
        onClick={() => setAbrirBuscador(true)}
        className="flex flex-1 items-center gap-3 rounded-xl border border-borde bg-superficie px-3 py-2 text-left text-sm text-texto-suave hover:border-borde-fuerte focus:border-marca-500 focus:outline-none focus:ring-2 focus:ring-marca-500/20"
        aria-label="Abrir buscador (atajo: /)"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Buscar cliente, teléfono, nota…</span>
        <span className="sm:hidden">Buscar</span>
        <kbd className="ml-auto hidden rounded-md border border-borde bg-superficie-alta px-1.5 py-0.5 text-[10px] font-medium text-texto-tenue sm:inline">
          /
        </kbd>
      </button>

      <Link
        href="/clientes/nuevo"
        className="boton boton-primario hidden sm:inline-flex !min-h-[40px] !py-2"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nuevo
      </Link>

      <SelectorTema compacto />

      <button
        type="button"
        onClick={() => setAbrirAyuda(true)}
        aria-label="Ayuda y tutorial"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-texto-suave hover:bg-superficie hover:text-marca-600"
      >
        <HelpCircle className="h-5 w-5" aria-hidden />
      </button>

      <Link
        href="/seguimiento"
        aria-label="Recordatorios y avisos"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-texto-suave hover:bg-superficie hover:text-marca-600"
      >
        <Bell className="h-5 w-5" aria-hidden />
      </Link>

      <div className="relative">
        <button
          onClick={() => setAbrirPerfil((v) => !v)}
          aria-label="Mi perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-marca-500 text-sm font-semibold text-white shadow-marca"
        >
          {iniciales(usuario.nombre)}
        </button>
        {abrirPerfil && (
          <div
            className="absolute right-0 top-12 z-40 w-56 tarjeta animate-aparecer"
            onMouseLeave={() => setAbrirPerfil(false)}
          >
            <div className="border-b border-borde p-3">
              <p className="text-sm font-semibold text-texto">{usuario.nombre}</p>
              <p className="text-xs text-texto-suave">{usuario.correo}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-marca-600">
                {usuario.rol}
              </p>
            </div>
            <div className="p-2">
              <Link
                href="/perfil"
                onClick={() => setAbrirPerfil(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-texto hover:bg-superficie"
              >
                <UserIcon className="h-4 w-4" /> Mi perfil
              </Link>
              <Link
                href="/configuracion"
                onClick={() => setAbrirPerfil(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-texto hover:bg-superficie"
              >
                <HelpCircle className="h-4 w-4" /> Configuración
              </Link>
              <button
                onClick={cerrarSesion}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-peligro hover:bg-peligro-suave dark:hover:bg-peligro/10"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <Buscador abierto={abrirBuscador} alCerrar={() => setAbrirBuscador(false)} />
      <LanzadorTutorial
        abierto={abrirAyuda}
        alCerrar={() => setAbrirAyuda(false)}
        rol={usuario.rol}
      />
    </header>
  );
}

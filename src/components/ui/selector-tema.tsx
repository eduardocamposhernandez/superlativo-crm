"use client";

import { useTema } from "@/components/proveedor-tema";
import { Sun, Moon, Monitor } from "lucide-react";

export function SelectorTema({ compacto = false }: { compacto?: boolean }) {
  const { tema, cambiarTema } = useTema();

  const opciones = [
    { id: "claro" as const, etiqueta: "Claro", Icono: Sun },
    { id: "oscuro" as const, etiqueta: "Oscuro", Icono: Moon },
    { id: "auto" as const, etiqueta: "Automático", Icono: Monitor },
  ];

  if (compacto) {
    return (
      <div
        role="radiogroup"
        aria-label="Tema"
        className="inline-flex items-center rounded-xl border border-borde bg-superficie-alta p-1"
      >
        {opciones.map(({ id, etiqueta, Icono }) => {
          const activo = tema === id;
          return (
            <button
              key={id}
              role="radio"
              aria-checked={activo}
              title={etiqueta}
              aria-label={`Tema ${etiqueta.toLowerCase()}`}
              onClick={() => cambiarTema(id)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                activo
                  ? "bg-marca-500 text-white shadow-marca"
                  : "text-texto-suave hover:bg-superficie hover:text-texto"
              }`}
            >
              <Icono className="h-4 w-4" aria-hidden />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2">
      {opciones.map(({ id, etiqueta, Icono }) => {
        const activo = tema === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={activo}
            onClick={() => cambiarTema(id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
              activo
                ? "border-marca-500 bg-marca-50 text-marca-700 dark:bg-marca-500/10 dark:text-marca-300"
                : "border-borde bg-superficie-alta text-texto hover:border-borde-fuerte"
            }`}
          >
            <Icono className="h-6 w-6" aria-hidden />
            <span className="text-sm font-medium">{etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}

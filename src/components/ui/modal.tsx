"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
  anchoMax?: "sm" | "md" | "lg" | "xl";
  pieDePagina?: React.ReactNode;
}

const anchos = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  children,
  anchoMax = "md",
  pieDePagina,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Esc cierra + trampa de foco básica
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // foco inicial
    setTimeout(() => ref.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [abierto, alCerrar]);

  if (!abierto || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-aparecer"
        onClick={alCerrar}
        aria-hidden
      />
      <div
        ref={ref}
        tabIndex={-1}
        className={`relative w-full ${anchos[anchoMax]} tarjeta bg-superficie-alta animate-aparecer rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-borde p-5">
          <div>
            <h2 id="modal-titulo" className="text-lg font-semibold text-texto">
              {titulo}
            </h2>
            {descripcion && (
              <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>
            )}
          </div>
          <button
            onClick={alCerrar}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-texto-suave hover:bg-superficie hover:text-texto"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {pieDePagina && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-borde p-4">
            {pieDePagina}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

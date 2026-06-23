"use client";

import { useState } from "react";
import { Info as InfoIcono } from "lucide-react";

interface Props {
  texto: string;
  className?: string;
}

/**
 * Ícono "i" con tooltip / popover.
 * Cumple regla 3.12: cada "i" da info útil y consejo.
 */
export function InfoI({ texto, className = "" }: Props) {
  const [abierto, setAbierto] = useState(false);
  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label="Más información"
        onClick={() => setAbierto((v) => !v)}
        onMouseEnter={() => setAbierto(true)}
        onMouseLeave={() => setAbierto(false)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-texto-tenue hover:text-marca-600 hover:bg-marca-50 dark:hover:bg-marca-500/10"
      >
        <InfoIcono className="h-4 w-4" aria-hidden />
      </button>
      {abierto && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-borde bg-superficie-alta p-3 text-xs text-texto shadow-flotante animate-aparecer"
        >
          {texto}
        </span>
      )}
    </span>
  );
}

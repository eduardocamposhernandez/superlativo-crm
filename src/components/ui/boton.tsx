"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variante = "primario" | "secundario" | "suave" | "peligro" | "fantasma";
type Tamano = "sm" | "md" | "lg";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
  iconoIzq?: React.ReactNode;
  iconoDer?: React.ReactNode;
  bloque?: boolean;
}

const variantes: Record<Variante, string> = {
  primario: "boton-primario",
  secundario: "boton-secundario",
  suave: "boton-suave",
  peligro: "boton-peligro",
  fantasma: "boton-fantasma",
};

const tamanos: Record<Tamano, string> = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-sm min-h-[44px]",
  lg: "px-6 py-3.5 text-base min-h-[52px]",
};

export const Boton = forwardRef<HTMLButtonElement, Props>(function Boton(
  {
    variante = "primario",
    tamano = "md",
    cargando,
    disabled,
    iconoIzq,
    iconoDer,
    bloque,
    className = "",
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || cargando}
      className={`boton ${variantes[variante]} ${tamanos[tamano]} ${bloque ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {cargando ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        iconoIzq
      )}
      {children}
      {!cargando && iconoDer}
    </button>
  );
});

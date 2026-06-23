import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface Props {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ icono: Icono, titulo, descripcion, accion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-borde bg-superficie-alta/50 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-marca-50 text-marca-600 dark:bg-marca-500/10 dark:text-marca-300">
        <Icono className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-texto">{titulo}</h3>
      {descripcion && (
        <p className="max-w-sm text-sm text-texto-suave">{descripcion}</p>
      )}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}

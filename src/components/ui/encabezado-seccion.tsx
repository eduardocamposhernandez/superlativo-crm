import type { LucideIcon } from "lucide-react";
import { InfoI } from "./info";
import { type ReactNode } from "react";

interface Props {
  Icono: LucideIcon;
  titulo: string;
  subtitulo?: string;
  ayuda?: string;
  accion?: ReactNode;
  colorMatiz?: string; // ej. "text-marca-600" — el matiz propio de la sección
}

export function EncabezadoSeccion({
  Icono,
  titulo,
  subtitulo,
  ayuda,
  accion,
  colorMatiz = "text-marca-600",
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:items-center">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-marca-50 ${colorMatiz} dark:bg-marca-500/10`}
        >
          <Icono className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-texto sm:text-3xl">{titulo}</h1>
            {ayuda && <InfoI texto={ayuda} />}
          </div>
          {subtitulo && (
            <p className="mt-0.5 text-sm text-texto-suave sm:text-base">
              {subtitulo}
            </p>
          )}
        </div>
      </div>
      {accion && <div>{accion}</div>}
    </div>
  );
}

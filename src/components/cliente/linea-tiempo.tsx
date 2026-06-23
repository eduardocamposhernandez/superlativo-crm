"use client";

import { fechaRelativa } from "@/lib/formato";
import { Clock, ArrowRight, DollarSign, FileText, User, Archive, Trophy, XCircle, Sparkles } from "lucide-react";

interface Evento {
  id: string;
  tipo: string;
  titulo: string;
  detalle: string | null;
  autorNombre: string | null;
  ocurridoEn: Date | string;
}

const ICONOS: Record<string, typeof Clock> = {
  creacion: User,
  etapa: ArrowRight,
  pago: DollarSign,
  cita: Clock,
  nota: FileText,
  archivo: FileText,
  estado: Trophy,
  cambio: Sparkles,
};

export function LineaTiempo({ eventos }: { eventos: Evento[] }) {
  return (
    <div className="tarjeta p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-texto">
        <Clock className="h-4 w-4 text-marca-600" /> Línea de tiempo
      </h2>
      {eventos.length === 0 ? (
        <p className="text-sm text-texto-suave">Sin actividad aún. Empieza un contacto y aparecerá aquí.</p>
      ) : (
        <ol className="space-y-3">
          {eventos.map((e) => {
            const Icono =
              ICONOS[e.tipo] ?? (e.titulo.includes("Perdido") ? XCircle : e.titulo.includes("Archivado") ? Archive : Clock);
            return (
              <li key={e.id} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-marca-50 text-marca-600 dark:bg-marca-500/10 dark:text-marca-300">
                  <Icono className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-texto">{e.titulo}</p>
                  {e.detalle && <p className="text-xs text-texto-suave">{e.detalle}</p>}
                  <p className="text-xs text-texto-tenue">
                    {fechaRelativa(e.ocurridoEn)}
                    {e.autorNombre && ` · ${e.autorNombre}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

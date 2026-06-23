import { dinero } from "@/lib/formato";
import { Target } from "lucide-react";

interface Props {
  cobrado: number;
  meta: number;
  diasFaltan: number;
  pronostico: number;
  semaforo: "verde" | "ambar" | "rojo";
}

export function ProgresoMeta({ cobrado, meta, diasFaltan, pronostico, semaforo }: Props) {
  const pct = meta > 0 ? Math.min(100, (cobrado / meta) * 100) : 0;
  const pctPronos = meta > 0 ? Math.min(100, ((cobrado + pronostico) / meta) * 100) : 0;
  const colorBarra = semaforo === "verde" ? "bg-marca-500" : semaforo === "ambar" ? "bg-aviso" : "bg-peligro";
  const colorSem = semaforo === "verde" ? "🟢 Vas a llegar" : semaforo === "ambar" ? "🟡 Ajustado, aprieta" : "🔴 Te falta — cierra HOY";
  const faltan = Math.max(0, meta - cobrado);

  return (
    <div className="tarjeta p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-marca-600" />
          <h2 className="text-lg font-bold text-texto">Meta del mes</h2>
        </div>
        <span className="text-sm font-medium text-texto-suave">{colorSem}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-marca-600">
        {dinero(cobrado)} <span className="text-texto-tenue text-lg font-normal">de {dinero(meta)}</span>
      </p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-borde">
        <div className={`h-full ${colorBarra} transition-all`} style={{ width: `${pct}%` }} />
        <div className="-mt-3 h-3 rounded-full border-r-2 border-marca-300" style={{ width: `${pctPronos}%`, opacity: 0.4 }} />
      </div>
      <p className="mt-2 text-xs text-texto-suave">
        {Math.round(pct)}% completado · faltan <strong>{diasFaltan} días</strong> · pronóstico con embudo:{" "}
        <strong className="text-marca-600">{dinero(cobrado + pronostico)}</strong>
        {faltan > 0 && <span> · necesitas cerrar <strong>{dinero(faltan)}</strong> más</span>}
      </p>
    </div>
  );
}

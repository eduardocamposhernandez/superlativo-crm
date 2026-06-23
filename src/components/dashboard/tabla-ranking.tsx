import { dinero, porcentaje } from "@/lib/formato";
import { Trophy } from "lucide-react";

interface Fila {
  id: string;
  nombre: string;
  ganados: number;
  ingresos: number;
  meta: number;
  pctMeta: number;
}

const MEDALLAS = ["🥇", "🥈", "🥉"];

export function TablaRanking({ ranking }: { ranking: Fila[] }) {
  return (
    <div className="tarjeta p-5">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-marca-600" />
        <h2 className="text-base font-semibold text-texto">Ranking del equipo</h2>
      </div>
      {ranking.length === 0 ? (
        <p className="text-sm text-texto-suave">Sin equipo aún.</p>
      ) : (
        <ul className="space-y-2">
          {ranking.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border border-borde p-3">
              <span className="text-xl">{MEDALLAS[i] ?? `${i + 1}.`}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-texto">{r.nombre}</p>
                <p className="text-xs text-texto-suave">
                  {dinero(r.ingresos)} · {r.ganados} cierres
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${r.pctMeta >= 1 ? "text-marca-600" : r.pctMeta >= 0.7 ? "text-aviso" : "text-peligro"}`}>
                  {porcentaje(r.pctMeta)}
                </p>
                <p className="text-[10px] text-texto-tenue">de meta</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

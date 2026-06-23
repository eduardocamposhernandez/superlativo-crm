import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  icono: React.ReactNode;
  titulo: string;
  valor: string;
  delta?: number | null;
  tono?: "marca" | "aviso" | "peligro";
}

export function CardNumero({ icono, titulo, valor, delta, tono = "marca" }: Props) {
  const colorIcono = tono === "aviso" ? "text-aviso" : tono === "peligro" ? "text-peligro" : "text-marca-600";
  return (
    <div className="tarjeta p-5">
      <div className="flex items-center gap-2 text-xs uppercase text-texto-suave">
        <span className={colorIcono}>{icono}</span>
        {titulo}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-texto">{valor}</p>
      {delta !== null && delta !== undefined && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${delta >= 0 ? "text-marca-600" : "text-peligro"}`}>
          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(0)}% vs mes pasado
        </p>
      )}
    </div>
  );
}

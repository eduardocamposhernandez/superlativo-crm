"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface Punto {
  mes: string;
  ingresos: number;
  clientes: number;
}

export function GraficaCrecimiento({ datos }: { datos: Punto[] }) {
  const algo = datos.some((d) => d.ingresos > 0 || d.clientes > 0);

  return (
    <div className="tarjeta p-5">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-marca-600" />
        <h2 className="text-lg font-bold text-texto">Crecimiento (6 meses)</h2>
      </div>
      <div className="h-72">
        {algo ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-borde))" />
              <XAxis dataKey="mes" stroke="rgb(var(--color-texto-suave))" fontSize={12} />
              <YAxis stroke="rgb(var(--color-texto-suave))" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => `$${v.toLocaleString("es-MX")}`}
                contentStyle={{
                  background: "rgb(var(--color-superficie-alta))",
                  border: "1px solid rgb(var(--color-borde))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="ingresos" fill="#3fbf8f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-texto-suave">
            <p>Aún juntando historial — esto se llena solo conforme cobres.</p>
          </div>
        )}
      </div>
    </div>
  );
}

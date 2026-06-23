import Link from "next/link";
import { XCircle, RotateCcw } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { fechaCorta } from "@/lib/formato";
import { Badge } from "@/components/ui/badge";

export default async function PaginaPerdidos() {
  const u = await exigirSesion();
  const filtroDueno = filtroPorRol(u);
  const clientes = await db.cliente.findMany({
    where: { eliminadoEn: null, estadoCartera: "PERDIDO", ...filtroDueno },
    orderBy: { actualizadoEn: "desc" },
    take: 200,
  });

  const motivos: Record<string, number> = {};
  for (const c of clientes) {
    const m = c.motivoPerdida || "Sin motivo";
    motivos[m] = (motivos[m] || 0) + 1;
  }
  const top = Object.entries(motivos).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <>
      <EncabezadoSeccion
        Icono={XCircle}
        titulo="Perdidos"
        subtitulo="Aprende por qué y reactiva"
        ayuda="Cada pérdida tiene un porqué. Saberlo es la mitad de la siguiente venta. Y muchos de estos vuelven si los reactivas con tacto."
        colorMatiz="text-gray-500"
      />
      {top.length > 0 && (
        <div className="mb-4 tarjeta p-5">
          <p className="mb-2 text-sm font-semibold text-texto">Motivos más comunes</p>
          <div className="flex flex-wrap gap-2">
            {top.map(([m, n]) => (
              <Badge key={m} tono="neutro">
                {m}: <strong className="ml-1">{n}</strong>
              </Badge>
            ))}
          </div>
        </div>
      )}
      {clientes.length === 0 ? (
        <EstadoVacio icono={XCircle} titulo="No hay clientes perdidos" descripcion="Sigue así." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {clientes.map((c) => (
            <li key={c.id} className="tarjeta p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/clientes/${c.id}`} className="enlace-nombre">
                  {c.nombre}
                </Link>
                <RotateCcw className="h-4 w-4 text-texto-tenue" aria-hidden />
              </div>
              <p className="mt-1 text-xs text-texto-suave">
                {c.motivoPerdida ?? "Sin motivo"} · {fechaCorta(c.actualizadoEn)}
              </p>
              <p className="mt-2 text-xs text-marca-600">
                Abre su ficha para <strong>reactivarlo</strong>.
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

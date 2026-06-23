import Link from "next/link";
import { Trophy } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { dinero, fechaCorta } from "@/lib/formato";

export default async function PaginaCompletados() {
  const u = await exigirSesion();
  const filtroDueno = filtroPorRol(u);
  const clientes = await db.cliente.findMany({
    where: { eliminadoEn: null, estadoCartera: "GANADO", ...filtroDueno },
    include: { vendedor: { select: { nombre: true } } },
    orderBy: { actualizadoEn: "desc" },
    take: 100,
  });
  const total = clientes.reduce((s, c) => s + c.valorEstimado, 0);

  return (
    <>
      <EncabezadoSeccion
        Icono={Trophy}
        titulo="Completados"
        subtitulo="Tu muro de victorias"
        ayuda="Cada cliente aquí es un cierre real. Celebra y aprende: lo que sirvió para uno te sirve con el siguiente."
        colorMatiz="text-green-600"
      />
      <div className="mb-4 tarjeta bg-marca-50 p-5 dark:bg-marca-500/10">
        <p className="text-sm text-marca-700 dark:text-marca-300">Total ganado</p>
        <p className="text-3xl font-bold tabular-nums text-marca-700 dark:text-marca-300">
          {dinero(total)} · {clientes.length} cierres
        </p>
      </div>

      {clientes.length === 0 ? (
        <EstadoVacio
          icono={Trophy}
          titulo="Aún no tienes clientes completados"
          descripcion="Cierra tu primera venta y aparecerá aquí 🎉"
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <li key={c.id} className="tarjeta p-4">
              <Link href={`/clientes/${c.id}`} className="enlace-nombre">
                {c.nombre}
              </Link>
              {c.empresaNombre && <p className="text-xs text-texto-suave">{c.empresaNombre}</p>}
              <p className="mt-2 text-xl font-bold tabular-nums text-marca-600">
                {dinero(c.valorEstimado)}
              </p>
              <p className="text-xs text-texto-tenue">
                Cerrado {fechaCorta(c.actualizadoEn)}
                {c.vendedor && ` · ${c.vendedor.nombre}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

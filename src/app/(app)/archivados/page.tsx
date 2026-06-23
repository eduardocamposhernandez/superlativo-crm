import Link from "next/link";
import { Archive } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { fechaCorta } from "@/lib/formato";

export default async function PaginaArchivados() {
  const u = await exigirSesion();
  const filtroDueno = filtroPorRol(u);
  const clientes = await db.cliente.findMany({
    where: { eliminadoEn: null, estadoCartera: "ARCHIVADO", ...filtroDueno },
    orderBy: { actualizadoEn: "desc" },
    take: 200,
  });
  return (
    <>
      <EncabezadoSeccion
        Icono={Archive}
        titulo="Archivados"
        subtitulo="Guardados sin perder nada"
        ayuda="Estos clientes no están activos pero NO se borraron. Restaúralos cuando los retomes."
        colorMatiz="text-stone-500"
      />
      {clientes.length === 0 ? (
        <EstadoVacio icono={Archive} titulo="No hay nada archivado" />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <li key={c.id} className="tarjeta p-4">
              <Link href={`/clientes/${c.id}`} className="enlace-nombre">
                {c.nombre}
              </Link>
              {c.empresaNombre && <p className="text-xs text-texto-suave">{c.empresaNombre}</p>}
              <p className="mt-1 text-xs text-texto-tenue">
                Archivado: {fechaCorta(c.actualizadoEn)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

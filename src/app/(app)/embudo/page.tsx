import Link from "next/link";
import { KanbanSquare, Trophy, XCircle, Archive } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { Embudo } from "@/components/embudo/embudo";

export default async function PaginaEmbudo() {
  const u = await exigirSesion();
  const filtroDueno = filtroPorRol(u);
  const clientes = await db.cliente.findMany({
    where: {
      eliminadoEn: null,
      estadoCartera: "ACTIVO",
      ...filtroDueno,
    },
    select: {
      id: true,
      nombre: true,
      etapa: true,
      temperatura: true,
      valorEstimado: true,
      proximaAccion: true,
      proximaAccionEn: true,
      empresaNombre: true,
      ultimoContacto: true,
    },
    take: 500,
    orderBy: { actualizadoEn: "desc" },
  });

  const config = await db.configuracion.findFirst();
  const umbral = config?.umbralEstancamiento ?? 7;

  const [completados, perdidos, archivados] = await Promise.all([
    db.cliente.count({ where: { eliminadoEn: null, estadoCartera: "GANADO", ...filtroDueno } }),
    db.cliente.count({ where: { eliminadoEn: null, estadoCartera: "PERDIDO", ...filtroDueno } }),
    db.cliente.count({ where: { eliminadoEn: null, estadoCartera: "ARCHIVADO", ...filtroDueno } }),
  ]);

  return (
    <>
      <EncabezadoSeccion
        Icono={KanbanSquare}
        titulo="Embudo"
        subtitulo="Mueve a cada cliente hacia la venta"
        ayuda="Arrastra cada tarjeta a la etapa en la que va. Abajo de cada columna ves cuánto dinero hay ahí. Solo se muestran clientes activos: los ganados, perdidos y archivados están en sus propias secciones."
        colorMatiz="text-indigo-600"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <AccesoEstado href="/completados" icono={<Trophy className="h-4 w-4" />} etiqueta="Completados" n={completados} />
        <AccesoEstado href="/perdidos" icono={<XCircle className="h-4 w-4" />} etiqueta="Perdidos" n={perdidos} />
        <AccesoEstado href="/archivados" icono={<Archive className="h-4 w-4" />} etiqueta="Archivados" n={archivados} />
      </div>

      <Embudo clientes={clientes} umbralEstancamientoDias={umbral} />
    </>
  );
}

function AccesoEstado({ href, icono, etiqueta, n }: { href: string; icono: React.ReactNode; etiqueta: string; n: number }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-borde bg-superficie-alta px-3 py-1.5 text-sm text-texto hover:border-marca-300 hover:bg-marca-50 dark:hover:bg-marca-500/10"
    >
      {icono} {etiqueta}{" "}
      <span className="rounded-full bg-marca-100 px-1.5 text-xs font-semibold text-marca-700 dark:bg-marca-500/20 dark:text-marca-300">
        {n}
      </span>
    </Link>
  );
}

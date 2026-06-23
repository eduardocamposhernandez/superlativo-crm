import Link from "next/link";
import { headers } from "next/headers";
import { Link as LinkIco } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PaginaPaginasAgenda() {
  const u = await exigirSesion();
  const h = await headers();
  const host = h.get("host") ?? "tu-crm.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`;

  const usuarios =
    u.rol === "ADMIN"
      ? await db.usuario.findMany({
          where: { activo: true, slugAgenda: { not: null } },
          include: { _count: { select: { citas: true } } },
        })
      : [await db.usuario.findUnique({ where: { id: u.id }, include: { _count: { select: { citas: true } } } })];

  const validos = usuarios.filter((x): x is NonNullable<typeof x> => !!x && !!x.slugAgenda);

  return (
    <>
      <EncabezadoSeccion
        Icono={LinkIco}
        titulo="Páginas de agenda"
        subtitulo="Tu liga para que te agenden solos"
        ayuda="Cada liga apunta a una página tipo Calendly. Cuando alguien agenda ahí, entra al CRM como tu cliente nuevo."
        colorMatiz="text-teal-600"
      />
      {validos.length === 0 ? (
        <EstadoVacio
          icono={LinkIco}
          titulo="Aún no hay ligas de agenda"
          descripcion="Asigna un slug a cada vendedor en el panel admin (ej. 'maria') para activar su liga."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {validos.map((v) => {
            const url = `${base}/agenda/${v.slugAgenda}`;
            return (
              <li key={v.id} className="tarjeta p-5">
                <p className="font-semibold text-texto">{v.nombre}</p>
                <Link href={url} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-marca-600 hover:underline">
                  {url}
                </Link>
                <p className="mt-2 text-xs text-texto-suave">{v._count.citas} citas generadas</p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

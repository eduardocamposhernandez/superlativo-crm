import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Users, Activity, Download, Trash2, Archive } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { fechaRelativa } from "@/lib/formato";

export default async function PaginaAdmin() {
  const u = await exigirSesion();
  if (u.rol !== "ADMIN") redirect("/tablero");

  const [usuarios, papelera, archivados, ultimasAcciones] = await Promise.all([
    db.usuario.count({ where: { activo: true } }),
    db.cliente.count({ where: { eliminadoEn: { not: null } } }),
    db.cliente.count({ where: { estadoCartera: "ARCHIVADO", eliminadoEn: null } }),
    db.registroAuditoria.findMany({
      orderBy: { ocurridoEn: "desc" },
      take: 25,
      include: { usuario: { select: { nombre: true } } },
    }),
  ]);

  return (
    <>
      <EncabezadoSeccion
        Icono={ShieldCheck}
        titulo="Panel admin"
        subtitulo="Tu equipo, tus datos, tu negocio"
        ayuda="Aquí controlas usuarios, ves la actividad del equipo y gestionas tus respaldos."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta href="/equipo" Icono={Users} titulo="Equipo" descripcion={`${usuarios} usuarios activos`} />
        <Tarjeta href="/papelera" Icono={Trash2} titulo="Papelera" descripcion={`${papelera} elementos borrados`} />
        <Tarjeta href="/archivados" Icono={Archive} titulo="Archivados" descripcion={`${archivados} clientes`} />
        <Tarjeta href="/api/exportar?tipo=todo" Icono={Download} titulo="Respaldar todo" descripcion="Descargar JSON + CSV" externo />
      </div>

      <div className="tarjeta p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-texto">
          <Activity className="h-4 w-4 text-marca-600" /> Actividad reciente del equipo
        </h2>
        {ultimasAcciones.length === 0 ? (
          <p className="text-sm text-texto-suave">Sin actividad aún.</p>
        ) : (
          <ul className="divide-y divide-borde">
            {ultimasAcciones.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <strong>{a.usuario?.nombre ?? "Sistema"}</strong> · {a.resumen}
                </span>
                <span className="text-xs text-texto-tenue">{fechaRelativa(a.ocurridoEn)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Tarjeta({
  href,
  Icono,
  titulo,
  descripcion,
  externo,
}: {
  href: string;
  Icono: typeof Users;
  titulo: string;
  descripcion: string;
  externo?: boolean;
}) {
  const clase = "tarjeta p-5 transition-shadow hover:shadow-elevada";
  const contenido = (
    <>
      <Icono className="h-6 w-6 text-marca-600" />
      <p className="mt-2 font-semibold text-texto">{titulo}</p>
      <p className="text-xs text-texto-suave">{descripcion}</p>
    </>
  );
  if (externo) {
    return (
      <a href={href} download className={clase}>
        {contenido}
      </a>
    );
  }
  return (
    <Link href={href} className={clase}>
      {contenido}
    </Link>
  );
}

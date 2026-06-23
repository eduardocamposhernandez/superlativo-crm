import { CalendarDays } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { Calendario } from "@/components/calendario/calendario";

export default async function PaginaAgenda() {
  const u = await exigirSesion();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 1);
  const fin = new Date();
  fin.setMonth(fin.getMonth() + 2);

  const citas = await db.cita.findMany({
    where: {
      eliminadoEn: null,
      inicio: { gte: inicio, lte: fin },
      ...(u.rol === "VENDEDOR" ? { vendedorId: u.id } : {}),
    },
    include: { cliente: { select: { id: true, nombre: true } } },
    orderBy: { inicio: "asc" },
  });

  const config = await db.configuracion.findFirst();

  return (
    <>
      <EncabezadoSeccion
        Icono={CalendarDays}
        titulo="Agenda"
        subtitulo="Tus citas, organizadas solas"
        ayuda="Toca un hueco libre para agendar. Si conectas Google Calendar, cada cita crea evento + Meet y manda invitación a tu cliente."
        colorMatiz="text-green-600"
      />
      <Calendario
        citas={citas.map((c) => ({
          id: c.id,
          inicio: c.inicio,
          duracionMin: c.duracionMin,
          titulo: c.titulo,
          estado: c.estado,
          clienteId: c.cliente?.id ?? null,
          clienteNombre: c.cliente?.nombre ?? c.nombreInvitado ?? "Cita",
        }))}
        horarioInicio={config?.horarioInicio ?? "09:00"}
        horarioFin={config?.horarioFin ?? "18:00"}
        duracionMin={config?.duracionCitaMin ?? 30}
      />
    </>
  );
}

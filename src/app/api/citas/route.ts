import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso } from "@/lib/permisos";
import { db } from "@/lib/db";
import { esquemaCita } from "@/lib/validaciones";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const body = await req.json();
    const datos = esquemaCita.parse(body);

    // Validar permiso para crear cita asignada a un vendedor
    if (u.rol === "VENDEDOR" && datos.vendedorId !== u.id) {
      const err: Error & { status?: number } = new Error("Solo puedes agendar tus propias citas");
      err.status = 403;
      throw err;
    }

    // Validar horario laboral
    const config = await db.configuracion.findFirst();
    const inicio = new Date(datos.inicio as string | Date);
    const h = inicio.getHours() * 60 + inicio.getMinutes();
    if (config) {
      const [hi, mi] = config.horarioInicio.split(":").map(Number);
      const [hf, mf] = config.horarioFin.split(":").map(Number);
      const minIni = hi * 60 + mi;
      const minFin = hf * 60 + mf;
      if (h < minIni || h + datos.duracionMin > minFin) {
        throw new Error(`Fuera de horario (${config.horarioInicio}-${config.horarioFin})`);
      }
    }

    // Validar choque con otra cita
    const fin = new Date(inicio.getTime() + datos.duracionMin * 60000);
    const choque = await db.cita.findFirst({
      where: {
        eliminadoEn: null,
        vendedorId: datos.vendedorId,
        inicio: { lt: fin, gte: new Date(inicio.getTime() - 24 * 60 * 60 * 1000) },
      },
    });
    if (choque) {
      const finChoque = new Date(choque.inicio.getTime() + choque.duracionMin * 60000);
      if (finChoque > inicio) {
        throw new Error("Ya tienes una cita en ese horario");
      }
    }

    const cita = await db.cita.create({
      data: {
        clienteId: datos.clienteId || null,
        vendedorId: datos.vendedorId,
        inicio,
        duracionMin: datos.duracionMin,
        titulo: datos.titulo || null,
        notas: datos.notas || null,
        nombreInvitado: datos.nombreInvitado || null,
        telefonoInvitado: datos.telefonoInvitado || null,
        correoInvitado: datos.correoInvitado || null,
        estado: "AGENDADA",
      },
    });

    if (datos.clienteId) {
      await db.eventoLineaTiempo.create({
        data: {
          clienteId: datos.clienteId,
          tipo: "cita",
          titulo: `Cita agendada para ${inicio.toLocaleDateString("es-MX")}`,
          autorId: u.id,
          autorNombre: u.nombre,
        },
      });
    }

    const tieneGoogle = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
    return { ...cita, sinGoogle: !tieneGoogle };
  });
}

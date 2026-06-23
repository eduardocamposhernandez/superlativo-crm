import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";

export async function GET(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q || q.length < 2) {
      return { clientes: [], citas: [], pagos: [], notas: [], etiquetas: [] };
    }
    const limite = 6;
    const filtroDueno = filtroPorRol(u);

    const [clientes, citasRaw, pagosRaw, notasRaw, etiquetas] = await Promise.all([
      db.cliente.findMany({
        where: {
          eliminadoEn: null,
          AND: [
            filtroDueno,
            {
              OR: [
                { nombre: { contains: q } },
                { telefono: { contains: q } },
                { correo: { contains: q } },
                { empresaNombre: { contains: q } },
                { notas: { contains: q } },
                { objecion: { contains: q } },
              ],
            },
          ],
        },
        select: { id: true, nombre: true, telefono: true, empresaNombre: true },
        take: limite,
        orderBy: { nombre: "asc" },
      }),
      db.cita.findMany({
        where: {
          eliminadoEn: null,
          OR: [
            { titulo: { contains: q } },
            { notas: { contains: q } },
            { nombreInvitado: { contains: q } },
          ],
          ...(u.rol === "VENDEDOR" ? { vendedorId: u.id } : {}),
        },
        select: { id: true, titulo: true, inicio: true, clienteId: true, nombreInvitado: true },
        take: limite,
        orderBy: { inicio: "desc" },
      }),
      db.pago.findMany({
        where: {
          eliminadoEn: null,
          OR: [{ concepto: { contains: q } }, { metodo: { contains: q } }],
          cliente: filtroDueno,
        },
        include: { cliente: { select: { id: true, nombre: true } } },
        take: limite,
        orderBy: { creadoEn: "desc" },
      }),
      db.nota.findMany({
        where: {
          eliminadoEn: null,
          contenido: { contains: q },
          cliente: filtroDueno,
        },
        include: { cliente: { select: { id: true, nombre: true } } },
        take: limite,
        orderBy: { creadaEn: "desc" },
      }),
      db.etiqueta.findMany({
        where: { nombre: { contains: q } },
        include: { _count: { select: { clientes: true } } },
        take: limite,
      }),
    ]);

    return {
      clientes,
      citas: citasRaw.map((c) => ({
        id: c.id,
        titulo: c.titulo || c.nombreInvitado || "Cita",
        inicio: c.inicio,
        clienteId: c.clienteId,
      })),
      pagos: pagosRaw
        .filter((p) => p.cliente)
        .map((p) => ({
          id: p.id,
          clienteId: p.cliente!.id,
          clienteNombre: p.cliente!.nombre,
          monto: p.monto,
        })),
      notas: notasRaw
        .filter((n) => n.cliente)
        .map((n) => ({
          id: n.id,
          clienteId: n.cliente!.id,
          clienteNombre: n.cliente!.nombre,
          contenido: n.contenido,
        })),
      etiquetas: etiquetas.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        cantidad: e._count.clientes,
      })),
    };
  });
}

import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { exigirPermiso } from "@/lib/permisos";
import {
  actualizarCliente,
  borrarSoftCliente,
  moverEtapa,
  marcarGanado,
  marcarPerdido,
  archivarCliente,
  restaurarCliente,
  reactivarCliente,
} from "@/lib/acciones-cliente";
import { esquemaCliente } from "@/lib/validaciones";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const c = await db.cliente.findUnique({
      where: { id },
      include: {
        vendedor: { select: { id: true, nombre: true } },
        etiquetas: { include: { etiqueta: true } },
        citas: { where: { eliminadoEn: null }, orderBy: { inicio: "desc" }, take: 20 },
        pagos: { where: { eliminadoEn: null }, orderBy: { creadoEn: "desc" } },
        notasLista: { where: { eliminadoEn: null }, orderBy: { creadaEn: "desc" }, include: { usuario: { select: { nombre: true } } } },
        archivos: { where: { eliminadoEn: null }, orderBy: { subidoEn: "desc" }, include: { subidoPor: { select: { nombre: true } } } },
        eventos: { orderBy: { ocurridoEn: "desc" }, take: 100 },
      },
    });
    if (!c) {
      const err: Error & { status?: number } = new Error("Cliente no encontrado");
      err.status = 404;
      throw err;
    }
    exigirPermiso(u, "ver", c);
    return c;
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const body = await req.json();

    if (body._accion === "etapa") {
      return moverEtapa(u, id, body.etapa);
    }
    if (body._accion === "ganar") return marcarGanado(u, id);
    if (body._accion === "perder") return marcarPerdido(u, id, String(body.motivo || "Sin motivo"));
    if (body._accion === "archivar") return archivarCliente(u, id);
    if (body._accion === "restaurar") return restaurarCliente(u, id);
    if (body._accion === "reactivar") return reactivarCliente(u, id);
    if (body._accion === "papelera-restaurar") {
      const { restaurarDesdePapelera } = await import("@/lib/acciones-cliente");
      await restaurarDesdePapelera(u, id);
      return { ok: true };
    }

    const datos = esquemaCliente.partial().parse(body);
    return actualizarCliente(u, id, datos);
  });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    await borrarSoftCliente(u, id);
    return { ok: true };
  });
}

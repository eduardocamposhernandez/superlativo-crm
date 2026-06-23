import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso } from "@/lib/permisos";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const p = await db.pago.findUnique({ where: { id }, include: { cliente: true } });
    if (!p) throw new Error("Pago no encontrado");
    exigirPermiso(u, "editar", p.cliente!);
    const body = await req.json();
    const actualizado = await db.pago.update({
      where: { id },
      data: {
        ...(body.estado && { estado: body.estado }),
        ...(body.fechaPago !== undefined && { fechaPago: body.fechaPago ? new Date(body.fechaPago) : null }),
      },
    });
    return actualizado;
  });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const p = await db.pago.findUnique({ where: { id }, include: { cliente: true } });
    if (!p) throw new Error("Pago no encontrado");
    exigirPermiso(u, "borrar", p.cliente!);
    await db.pago.update({ where: { id }, data: { eliminadoEn: new Date() } });
    return { ok: true };
  });
}

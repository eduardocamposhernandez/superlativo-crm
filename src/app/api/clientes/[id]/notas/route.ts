import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso } from "@/lib/permisos";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const c = await db.cliente.findUnique({ where: { id } });
    if (!c) throw new Error("Cliente no encontrado");
    exigirPermiso(u, "editar", c);
    const { contenido } = await req.json();
    if (!contenido?.trim()) throw new Error("Escribe algo");

    const n = await db.nota.create({
      data: { clienteId: id, contenido: contenido.trim(), usuarioId: u.id },
    });
    await db.cliente.update({ where: { id }, data: { ultimoContacto: new Date() } });
    await db.eventoLineaTiempo.create({
      data: {
        clienteId: id,
        tipo: "nota",
        titulo: "Nota nueva",
        detalle: contenido.slice(0, 120),
        autorId: u.id,
        autorNombre: u.nombre,
      },
    });
    return n;
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const c = await db.cliente.findUnique({ where: { id } });
    if (!c) throw new Error("Cliente no encontrado");
    exigirPermiso(u, "editar", c);
    const notaId = req.nextUrl.searchParams.get("id");
    if (!notaId) throw new Error("Falta id de nota");
    await db.nota.update({ where: { id: notaId }, data: { eliminadoEn: new Date() } });
    return { ok: true };
  });
}

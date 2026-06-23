import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const p = await db.plantilla.findUnique({ where: { id } });
    if (!p || p.usuarioId !== u.id) {
      const err: Error & { status?: number } = new Error("No autorizado");
      err.status = 403;
      throw err;
    }
    const body = await req.json();
    const actualizada = await db.plantilla.update({
      where: { id },
      data: {
        nombre: body.nombre,
        canal: body.canal,
        asunto: body.asunto || null,
        cuerpo: body.cuerpo,
        favorita: !!body.favorita,
        etapa: body.etapa || null,
        objecion: body.objecion || null,
      },
    });
    return actualizada;
  });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const p = await db.plantilla.findUnique({ where: { id } });
    if (!p || p.usuarioId !== u.id) {
      const err: Error & { status?: number } = new Error("No autorizado");
      err.status = 403;
      throw err;
    }
    await db.plantilla.delete({ where: { id } });
    return { ok: true };
  });
}

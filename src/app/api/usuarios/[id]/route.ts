import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi, hashearContrasena } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    if (u.rol !== "ADMIN" && u.id !== id) {
      const err: Error & { status?: number } = new Error("No autorizado");
      err.status = 403;
      throw err;
    }
    const body = await req.json();
    const datos: Record<string, unknown> = {};
    if (body.nombre !== undefined) datos.nombre = body.nombre;
    if (body.correo !== undefined) datos.correo = String(body.correo).toLowerCase();
    if (body.activo !== undefined && u.rol === "ADMIN") datos.activo = !!body.activo;
    if (body.rol !== undefined && u.rol === "ADMIN") datos.rol = body.rol;
    if (body.metaMensual !== undefined && u.rol === "ADMIN") datos.metaMensual = Number(body.metaMensual);
    if (body.metaClientesMensual !== undefined && u.rol === "ADMIN") datos.metaClientesMensual = Number(body.metaClientesMensual);
    if (body.slugAgenda !== undefined && u.rol === "ADMIN") datos.slugAgenda = body.slugAgenda || null;
    if (body.contrasena) {
      if (String(body.contrasena).length < 8) throw new Error("Mínimo 8 caracteres");
      datos.contrasenaHash = await hashearContrasena(body.contrasena);
    }

    const actualizado = await db.usuario.update({ where: { id }, data: datos });
    await db.registroAuditoria.create({
      data: {
        usuarioId: u.id,
        accion: "EDITAR",
        recursoTipo: "Usuario",
        recursoId: id,
        resumen: `${u.nombre} editó al usuario ${actualizado.nombre}`,
      },
    });
    return { ok: true };
  });
}

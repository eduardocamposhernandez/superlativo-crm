import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi, hashearContrasena, compararContrasena } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const body = await req.json();
    const datos: Record<string, unknown> = {};
    if (body.nombre) datos.nombre = body.nombre;
    if (body.correo) datos.correo = String(body.correo).toLowerCase();
    if (body.contrasenaNueva) {
      if (!body.contrasenaActual) throw new Error("Pon tu contraseña actual");
      if (String(body.contrasenaNueva).length < 8) throw new Error("Mínimo 8 caracteres");
      const actual = await db.usuario.findUnique({ where: { id: u.id } });
      if (!actual) throw new Error("Sesión inválida");
      const ok = await compararContrasena(body.contrasenaActual, actual.contrasenaHash);
      if (!ok) throw new Error("Contraseña actual incorrecta");
      datos.contrasenaHash = await hashearContrasena(body.contrasenaNueva);
    }
    await db.usuario.update({ where: { id: u.id }, data: datos });
    return { ok: true };
  });
}

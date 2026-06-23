import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi, hashearContrasena } from "@/lib/auth";
import { db } from "@/lib/db";
import { esquemaUsuario } from "@/lib/validaciones";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    if (u.rol !== "ADMIN") {
      const err: Error & { status?: number } = new Error("Solo admin");
      err.status = 403;
      throw err;
    }
    const body = await req.json();
    const datos = esquemaUsuario.parse(body);
    if (!datos.contrasena) throw new Error("La contraseña es obligatoria para usuarios nuevos");
    const yaExiste = await db.usuario.findUnique({ where: { correo: datos.correo } });
    if (yaExiste) throw new Error("Ya hay un usuario con ese correo");

    const nuevo = await db.usuario.create({
      data: {
        nombre: datos.nombre,
        correo: datos.correo,
        contrasenaHash: await hashearContrasena(datos.contrasena),
        rol: datos.rol,
        metaMensual: datos.metaMensual,
        metaClientesMensual: datos.metaClientesMensual,
        slugAgenda: (body.slugAgenda || "").trim() || null,
      },
    });
    await db.registroAuditoria.create({
      data: {
        usuarioId: u.id,
        accion: "CREAR",
        recursoTipo: "Usuario",
        recursoId: nuevo.id,
        resumen: `${u.nombre} creó al usuario ${nuevo.nombre} (${nuevo.rol})`,
      },
    });
    return { id: nuevo.id };
  });
}

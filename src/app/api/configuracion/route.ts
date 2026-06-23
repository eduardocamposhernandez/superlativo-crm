import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    if (u.rol !== "ADMIN") {
      const err: Error & { status?: number } = new Error("Solo admin");
      err.status = 403;
      throw err;
    }
    const body = await req.json();
    const existente = await db.configuracion.findFirst();
    if (existente) {
      await db.configuracion.update({ where: { id: existente.id }, data: body });
    } else {
      await db.configuracion.create({ data: body });
    }
    await db.registroAuditoria.create({
      data: {
        usuarioId: u.id,
        accion: "EDITAR",
        recursoTipo: "Configuracion",
        resumen: `${u.nombre} actualizó la configuración del negocio`,
      },
    });
    return { ok: true };
  });
}

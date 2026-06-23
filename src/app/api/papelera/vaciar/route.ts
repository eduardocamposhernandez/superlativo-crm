import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  return manejar(async () => {
    const u = await exigirSesionApi();
    if (u.rol !== "ADMIN") {
      const err: Error & { status?: number } = new Error("Solo admin");
      err.status = 403;
      throw err;
    }
    const r = await db.cliente.deleteMany({ where: { eliminadoEn: { not: null } } });
    await db.registroAuditoria.create({
      data: {
        usuarioId: u.id,
        accion: "BORRAR",
        recursoTipo: "Cliente",
        resumen: `${u.nombre} vació la papelera (${r.count} elementos)`,
      },
    });
    return { borrados: r.count };
  });
}

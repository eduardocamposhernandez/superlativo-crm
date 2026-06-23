import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  return manejar(async () => {
    const u = await exigirSesionApi();
    await db.usuario.update({
      where: { id: u.id },
      data: { onboardingCompletado: true },
    });
    return { ok: true };
  });
}

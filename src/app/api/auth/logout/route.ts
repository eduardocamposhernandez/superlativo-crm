import { manejar } from "@/lib/respuesta-api";
import { cerrarSesion } from "@/lib/auth";

export async function POST() {
  return manejar(async () => {
    await cerrarSesion();
    return { ok: true };
  });
}

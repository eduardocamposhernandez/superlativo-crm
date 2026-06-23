import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { obtenerUsuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await obtenerUsuarioActual();
    if (!u) return { sinSesion: true };
    const { tema } = await req.json();
    if (!["claro", "oscuro", "auto"].includes(tema)) return { ok: false };
    await db.usuario.update({ where: { id: u.id }, data: { temaPreferido: tema } });
    return { ok: true };
  });
}

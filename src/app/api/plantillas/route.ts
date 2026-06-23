import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const body = await req.json();
    if (!body.nombre?.trim() || !body.cuerpo?.trim()) throw new Error("Falta nombre o cuerpo");
    const p = await db.plantilla.create({
      data: {
        usuarioId: u.id,
        nombre: body.nombre,
        canal: body.canal || "whatsapp",
        asunto: body.asunto || null,
        cuerpo: body.cuerpo,
        favorita: !!body.favorita,
        etapa: body.etapa || null,
        objecion: body.objecion || null,
      },
    });
    return p;
  });
}

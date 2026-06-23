import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { iniciarSesion } from "@/lib/auth";
import { esquemaLogin } from "@/lib/validaciones";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const body = await req.json();
    const datos = esquemaLogin.parse(body);
    const ip = req.headers.get("x-forwarded-for") ?? undefined;
    const r = await iniciarSesion(datos.correo, datos.contrasena, ip);
    if (!r.ok) {
      const err: Error & { status?: number } = new Error(r.mensaje);
      err.status = 401;
      throw err;
    }
    return { usuario: r.usuario };
  });
}

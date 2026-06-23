import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso } from "@/lib/permisos";
import { db } from "@/lib/db";

const TIPOS_OK = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const c = await db.cliente.findUnique({ where: { id } });
    if (!c) throw new Error("Cliente no encontrado");
    exigirPermiso(u, "editar", c);

    const { nombre, tipoMime, tamanoBytes, etiqueta, contenidoBase } = await req.json();

    if (!TIPOS_OK.includes(tipoMime)) throw new Error("Solo PDF, JPG o PNG");
    if (tamanoBytes > MAX_BYTES) throw new Error("Archivo demasiado grande (máx 4 MB)");
    if (!contenidoBase) throw new Error("Archivo vacío");

    const a = await db.archivo.create({
      data: {
        clienteId: id,
        nombre,
        etiqueta: etiqueta || "Otro",
        tipoMime,
        tamanoBytes,
        contenidoBase,
        subidoPorId: u.id,
      },
    });
    await db.eventoLineaTiempo.create({
      data: {
        clienteId: id,
        tipo: "archivo",
        titulo: `Archivo subido: ${nombre}`,
        detalle: etiqueta,
        autorId: u.id,
        autorNombre: u.nombre,
      },
    });
    return { id: a.id };
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { id } = await ctx.params;
    const c = await db.cliente.findUnique({ where: { id } });
    if (!c) throw new Error("Cliente no encontrado");
    exigirPermiso(u, "editar", c);
    const archivoId = req.nextUrl.searchParams.get("id");
    if (!archivoId) throw new Error("Falta id");
    await db.archivo.update({ where: { id: archivoId }, data: { eliminadoEn: new Date() } });
    return { ok: true };
  });
}

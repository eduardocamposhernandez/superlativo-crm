import { NextRequest, NextResponse } from "next/server";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso } from "@/lib/permisos";
import { db } from "@/lib/db";

/** Sirve el contenido de un archivo guardado en base64 dentro de la base. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; archivoId: string }> }) {
  try {
    const u = await exigirSesionApi();
    const { id, archivoId } = await ctx.params;
    const c = await db.cliente.findUnique({ where: { id } });
    if (!c) return new NextResponse("No encontrado", { status: 404 });
    exigirPermiso(u, "ver", c);
    const a = await db.archivo.findFirst({
      where: { id: archivoId, clienteId: id, eliminadoEn: null },
    });
    if (!a) return new NextResponse("No encontrado", { status: 404 });
    if (a.url) return NextResponse.redirect(a.url);
    if (!a.contenidoBase) return new NextResponse("Archivo vacío", { status: 404 });
    const buffer = Buffer.from(a.contenidoBase, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": a.tipoMime,
        "Content-Disposition": `inline; filename="${encodeURIComponent(a.nombre)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("No autorizado", { status: 401 });
  }
}

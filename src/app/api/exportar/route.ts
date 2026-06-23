import { NextRequest, NextResponse } from "next/server";
import { exigirSesionApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";

/**
 * Exporta clientes, pagos o todo en CSV/JSON.
 * - El admin obtiene todo el respaldo.
 * - El vendedor solo lo suyo (CSV).
 * - NUNCA incluye contraseñas ni llaves.
 */
export async function GET(req: NextRequest) {
  try {
    const u = await exigirSesionApi();
    const tipo = req.nextUrl.searchParams.get("tipo") ?? "clientes";

    if (tipo === "todo") {
      if (u.rol !== "ADMIN") return new NextResponse("No autorizado", { status: 403 });
      const [clientes, pagos, citas, notas, usuarios, eventos, plantillas, etiquetas, config] = await Promise.all([
        db.cliente.findMany({ include: { etiquetas: { include: { etiqueta: true } } } }),
        db.pago.findMany(),
        db.cita.findMany(),
        db.nota.findMany(),
        db.usuario.findMany({
          select: { id: true, nombre: true, correo: true, rol: true, activo: true, slugAgenda: true, metaMensual: true, metaClientesMensual: true, creadoEn: true },
        }),
        db.eventoLineaTiempo.findMany(),
        db.plantilla.findMany(),
        db.etiqueta.findMany(),
        db.configuracion.findFirst(),
      ]);
      await db.registroAuditoria.create({
        data: { usuarioId: u.id, accion: "EXPORTAR", recursoTipo: "Todo", resumen: `${u.nombre} exportó respaldo completo` },
      });
      const payload = { exportadoEn: new Date(), clientes, pagos, citas, notas, usuarios, eventos, plantillas, etiquetas, config };
      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="superlativo-respaldo-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    const filtroDueno = filtroPorRol(u);
    let datos: Record<string, unknown>[] = [];
    let cabeceras: string[] = [];

    if (tipo === "clientes") {
      const clientes = await db.cliente.findMany({
        where: { eliminadoEn: null, ...filtroDueno },
        include: { vendedor: { select: { nombre: true } } },
      });
      cabeceras = ["nombre", "telefono", "correo", "empresa", "etapa", "estado", "temperatura", "valor_estimado", "origen", "vendedor", "creado"];
      datos = clientes.map((c) => ({
        nombre: c.nombre,
        telefono: c.telefono ?? "",
        correo: c.correo ?? "",
        empresa: c.empresaNombre ?? "",
        etapa: c.etapa,
        estado: c.estadoCartera,
        temperatura: c.temperatura ?? "",
        valor_estimado: c.valorEstimado,
        origen: c.origen ?? "",
        vendedor: c.vendedor?.nombre ?? "",
        creado: c.creadoEn.toISOString(),
      }));
    } else if (tipo === "pagos") {
      const pagos = await db.pago.findMany({
        where: { eliminadoEn: null, cliente: filtroDueno },
        include: { cliente: { select: { nombre: true } } },
      });
      cabeceras = ["cliente", "monto", "moneda", "metodo", "estado", "fecha_pago", "concepto"];
      datos = pagos.map((p) => ({
        cliente: p.cliente?.nombre ?? "",
        monto: p.monto,
        moneda: p.moneda,
        metodo: p.metodo,
        estado: p.estado,
        fecha_pago: p.fechaPago?.toISOString() ?? "",
        concepto: p.concepto ?? "",
      }));
    } else {
      return new NextResponse("Tipo no válido", { status: 400 });
    }

    await db.registroAuditoria.create({
      data: { usuarioId: u.id, accion: "EXPORTAR", recursoTipo: tipo, resumen: `${u.nombre} exportó ${tipo} (${datos.length})` },
    });

    const csv = [
      cabeceras.join(","),
      ...datos.map((fila) =>
        cabeceras
          .map((k) => {
            const v = String(fila[k] ?? "").replace(/"/g, '""');
            return /[,"\n]/.test(v) ? `"${v}"` : v;
          })
          .join(","),
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${tipo}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return new NextResponse(err.message, { status: err.status ?? 500 });
  }
}

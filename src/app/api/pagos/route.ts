import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso, filtroPorRol } from "@/lib/permisos";
import { db } from "@/lib/db";
import { esquemaPago } from "@/lib/validaciones";

export async function GET(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const sp = req.nextUrl.searchParams;
    const estado = sp.get("estado");
    const filtroDueno = filtroPorRol(u);
    const where: Record<string, unknown> = {
      eliminadoEn: null,
      cliente: filtroDueno,
      ...(estado ? { estado } : {}),
    };
    const pagos = await db.pago.findMany({
      where,
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { creadoEn: "desc" },
      take: 200,
    });
    return pagos;
  });
}

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const body = await req.json();
    const datos = esquemaPago.parse(body);
    const c = await db.cliente.findUnique({ where: { id: datos.clienteId } });
    if (!c) throw new Error("Cliente no encontrado");
    exigirPermiso(u, "editar", c);

    // TRANSACCIÓN: pago + actualizar último contacto + evento + auditoría
    const p = await db.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          clienteId: datos.clienteId,
          monto: datos.monto,
          moneda: datos.moneda,
          metodo: datos.metodo,
          concepto: datos.concepto || null,
          estado: datos.estado,
          fechaPago: datos.fechaPago ? new Date(datos.fechaPago as string | Date) : null,
          fechaVencimiento: datos.fechaVencimiento ? new Date(datos.fechaVencimiento as string | Date) : null,
          registradoPorId: u.id,
        },
      });
      await tx.cliente.update({
        where: { id: datos.clienteId },
        data: { ultimoContacto: new Date() },
      });
      await tx.eventoLineaTiempo.create({
        data: {
          clienteId: datos.clienteId,
          tipo: "pago",
          titulo: `Pago ${datos.estado.toLowerCase()} — $${datos.monto.toLocaleString("es-MX")}`,
          detalle: datos.metodo,
          autorId: u.id,
          autorNombre: u.nombre,
        },
      });
      await tx.registroAuditoria.create({
        data: {
          usuarioId: u.id,
          accion: "CREAR",
          recursoTipo: "Pago",
          recursoId: pago.id,
          resumen: `${u.nombre} registró pago de $${datos.monto} para ${c.nombre}`,
        },
      });
      return pago;
    });

    return p;
  });
}

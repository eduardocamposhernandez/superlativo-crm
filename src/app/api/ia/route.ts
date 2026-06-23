import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { exigirPermiso } from "@/lib/permisos";
import { db } from "@/lib/db";
import {
  iaActivada,
  iaClasificarTemperatura,
  iaManejarObjecion,
  iaRedactarMensaje,
  iaResumir,
  iaSugerirAccion,
} from "@/lib/ia";

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const { accion, clienteId, canal, plantillaBase, objecion } = await req.json();
    const c = await db.cliente.findUnique({
      where: { id: clienteId },
      include: { notasLista: { orderBy: { creadaEn: "desc" }, take: 5 } },
    });
    if (!c) throw new Error("Cliente no encontrado");
    exigirPermiso(u, "ver", c);

    const ctx = {
      nombre: c.nombre,
      etapa: c.etapa,
      temperatura: c.temperatura,
      objecion: c.objecion,
      valorEstimado: c.valorEstimado,
      servicioInteres: c.servicioInteres,
    };
    const notas = c.notasLista.map((n) => n.contenido);

    let resultado: unknown;
    switch (accion) {
      case "mensaje":
        resultado = await iaRedactarMensaje(ctx, canal === "correo" ? "correo" : "whatsapp", plantillaBase || "");
        break;
      case "temperatura":
        resultado = await iaClasificarTemperatura(ctx, notas);
        break;
      case "accion":
        resultado = await iaSugerirAccion(ctx);
        break;
      case "resumen":
        resultado = await iaResumir(ctx, notas);
        break;
      case "objecion":
        resultado = await iaManejarObjecion(objecion || c.objecion || "Lo voy a pensar", ctx);
        break;
      default:
        throw new Error("Acción IA no válida");
    }
    return { resultado, iaActiva: iaActivada() };
  });
}

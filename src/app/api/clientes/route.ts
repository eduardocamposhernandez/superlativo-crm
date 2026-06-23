import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { exigirSesionApi } from "@/lib/auth";
import { crearCliente, listarClientes } from "@/lib/acciones-cliente";
import { esquemaCliente } from "@/lib/validaciones";

export async function GET(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const sp = req.nextUrl.searchParams;
    return listarClientes(u, {
      busqueda: sp.get("q") ?? undefined,
      etapa: sp.get("etapa") ?? undefined,
      estado: sp.get("estado") ?? undefined,
      temperatura: sp.get("temperatura") ?? undefined,
      vendedorId: sp.get("vendedor") ?? undefined,
      etiqueta: sp.get("etiqueta") ?? undefined,
      proximaVencida: sp.get("vencida") === "1",
      favoritos: sp.get("favoritos") === "1",
      ordenar: sp.get("orden") ?? undefined,
      pagina: Number(sp.get("pagina") ?? 1),
      porPagina: Number(sp.get("porPagina") ?? 25),
    });
  });
}

export async function POST(req: NextRequest) {
  return manejar(async () => {
    const u = await exigirSesionApi();
    const body = await req.json();
    const datos = esquemaCliente.parse(body);
    return crearCliente(u, datos);
  });
}

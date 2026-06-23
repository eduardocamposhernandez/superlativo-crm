import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Envoltura para rutas API: maneja errores y respuestas de forma consistente.
 * NUNCA muestra detalles técnicos crudos al usuario (auditoría 1.I).
 */
export async function manejar<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    if (e instanceof ZodError) {
      const primerError = e.errors[0]?.message ?? "Datos no válidos";
      return NextResponse.json(
        { ok: false, mensaje: primerError, errores: e.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const err = e as Error & { status?: number };
    console.error("[API] Error:", err.message, err.stack);
    const status = err.status ?? 500;
    const mensaje =
      status === 401
        ? "Inicia sesión para continuar"
        : status === 403
        ? "No tienes permiso para esta acción"
        : status === 404
        ? "No encontramos lo que buscas"
        : status === 400
        ? err.message
        : "Algo se atoró. Intenta de nuevo.";
    return NextResponse.json({ ok: false, mensaje }, { status });
  }
}

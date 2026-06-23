/**
 * Autenticación propia simple y robusta:
 * - Contraseñas hasheadas con bcryptjs (salt 12, NUNCA texto plano).
 * - Sesión en cookie httpOnly + sameSite + secure (en producción).
 * - Token aleatorio guardado en tabla Sesion (revocable).
 * - Toda la lógica vive en el SERVIDOR.
 *
 * No uso next-auth para mantener mínima la complejidad y no depender
 * de un beta que cambia. La interfaz es propia pero estándar.
 */

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { redirect } from "next/navigation";
import type { UsuarioSesion, Rol } from "./permisos";
import crypto from "crypto";

const NOMBRE_COOKIE = "superlativo_sesion";
const DURACION_DIAS = 30;

export async function hashearContrasena(plana: string): Promise<string> {
  return bcrypt.hash(plana, 12);
}

export async function compararContrasena(
  plana: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plana, hash);
}

function tokenNuevo(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function iniciarSesion(
  correo: string,
  contrasena: string,
  ip?: string,
): Promise<{ ok: true; usuario: UsuarioSesion } | { ok: false; mensaje: string }> {
  const correoLimpio = correo.trim().toLowerCase();
  const u = await db.usuario.findUnique({ where: { correo: correoLimpio } });

  // No revelar si el correo existe (auditoría 1.J)
  if (!u || !u.activo) {
    // pequeña espera para mitigar timing attacks
    await new Promise((r) => setTimeout(r, 300));
    return { ok: false, mensaje: "Correo o contraseña incorrectos" };
  }

  // Bloqueo temporal por intentos fallidos
  if (u.bloqueadoHasta && u.bloqueadoHasta > new Date()) {
    return {
      ok: false,
      mensaje:
        "Cuenta bloqueada temporalmente por demasiados intentos. Intenta en unos minutos.",
    };
  }

  const ok = await compararContrasena(contrasena, u.contrasenaHash);
  if (!ok) {
    const intentos = u.intentosFallidos + 1;
    const bloqueadoHasta =
      intentos >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await db.usuario.update({
      where: { id: u.id },
      data: { intentosFallidos: intentos, bloqueadoHasta },
    });
    return { ok: false, mensaje: "Correo o contraseña incorrectos" };
  }

  // Resetear intentos al éxito
  await db.usuario.update({
    where: { id: u.id },
    data: { intentosFallidos: 0, bloqueadoHasta: null },
  });

  const token = tokenNuevo();
  const expiraEn = new Date(Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000);
  await db.sesion.create({
    data: { token, usuarioId: u.id, expiraEn },
  });

  const c = await cookies();
  c.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEn,
  });

  // Bitácora
  await db.registroAuditoria.create({
    data: {
      usuarioId: u.id,
      accion: "INICIAR_SESION",
      recursoTipo: "Usuario",
      recursoId: u.id,
      resumen: `${u.nombre} inició sesión`,
      ip,
    },
  });

  return {
    ok: true,
    usuario: { id: u.id, rol: u.rol as Rol, nombre: u.nombre, correo: u.correo },
  };
}

export async function cerrarSesion(): Promise<void> {
  const c = await cookies();
  const token = c.get(NOMBRE_COOKIE)?.value;
  if (token) {
    await db.sesion.deleteMany({ where: { token } }).catch(() => null);
  }
  c.delete(NOMBRE_COOKIE);
}

/** Devuelve el usuario logueado o null. Para usar en server components y APIs. */
export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  try {
    const c = await cookies();
    const token = c.get(NOMBRE_COOKIE)?.value;
    if (!token) return null;
    const s = await db.sesion.findUnique({
      where: { token },
      include: { usuario: true },
    });
    if (!s || s.expiraEn < new Date() || !s.usuario.activo) return null;
    return {
      id: s.usuario.id,
      rol: s.usuario.rol as Rol,
      nombre: s.usuario.nombre,
      correo: s.usuario.correo,
    };
  } catch {
    return null;
  }
}

/** Exige usuario logueado o redirige al login (para páginas protegidas). */
export async function exigirSesion(): Promise<UsuarioSesion> {
  const u = await obtenerUsuarioActual();
  if (!u) redirect("/login");
  return u;
}

/** Para APIs: devuelve respuesta 401/403 si no hay permiso. */
export async function exigirSesionApi(): Promise<UsuarioSesion> {
  const u = await obtenerUsuarioActual();
  if (!u) {
    const err: Error & { status?: number } = new Error("No autenticado");
    err.status = 401;
    throw err;
  }
  return u;
}

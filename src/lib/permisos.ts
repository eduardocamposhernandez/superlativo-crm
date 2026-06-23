/**
 * Control de acceso CENTRAL (auditoría 1: validado SIEMPRE en servidor).
 *
 * Reglas:
 *   - ADMIN: todo.
 *   - VENDEDOR: solo sus clientes/citas/pagos y su meta.
 *   - SOLO_LECTURA: lee todo, no edita.
 */

export type Rol = "ADMIN" | "VENDEDOR" | "SOLO_LECTURA";

export type UsuarioSesion = {
  id: string;
  rol: Rol;
  nombre: string;
  correo: string;
};

export type Accion =
  | "ver"
  | "editar"
  | "borrar"
  | "archivar"
  | "restaurar"
  | "exportar"
  | "reasignar"
  | "administrar";

interface RecursoConDueno {
  vendedorId?: string | null;
  usuarioId?: string | null;
  registradoPorId?: string | null;
}

// (Rol exportado arriba como type literal)

export function esAdmin(u: UsuarioSesion | null | undefined): boolean {
  return u?.rol === "ADMIN";
}

export function esVendedor(u: UsuarioSesion | null | undefined): boolean {
  return u?.rol === "VENDEDOR";
}

export function puede(
  usuario: UsuarioSesion | null | undefined,
  accion: Accion,
  recurso?: RecursoConDueno | null,
): boolean {
  if (!usuario) return false;

  // SOLO_LECTURA: solo "ver"
  if (usuario.rol === "SOLO_LECTURA") {
    return accion === "ver";
  }

  // ADMIN: todo
  if (usuario.rol === "ADMIN") return true;

  // VENDEDOR
  if (accion === "administrar" || accion === "reasignar") return false;
  if (accion === "exportar") return false; // solo admin exporta toda la base
  if (!recurso) return true;
  const dueno = recurso.vendedorId ?? recurso.usuarioId ?? recurso.registradoPorId ?? null;
  // si no tiene dueño asignado, puede tomarlo (clientes "Nuevo" sin dueño)
  if (!dueno) return true;
  return dueno === usuario.id;
}

/** Filtros para queries de Prisma: limita lo que ve un vendedor */
export function filtroPorRol(usuario: UsuarioSesion) {
  if (usuario.rol === "ADMIN" || usuario.rol === "SOLO_LECTURA") return {};
  // Vendedor: solo los suyos o sin dueño (leads nuevos sin asignar)
  return {
    OR: [{ vendedorId: usuario.id }, { vendedorId: null }],
  };
}

/** Lanza si no tiene permiso (atajo para rutas API) */
export function exigirPermiso(
  usuario: UsuarioSesion | null | undefined,
  accion: Accion,
  recurso?: RecursoConDueno | null,
): asserts usuario is UsuarioSesion {
  if (!puede(usuario, accion, recurso)) {
    const err: Error & { status?: number } = new Error("No autorizado");
    err.status = 403;
    throw err;
  }
}

import { db } from "./db";
import { exigirPermiso, filtroPorRol, type UsuarioSesion } from "./permisos";
import { esquemaCliente } from "./validaciones";
import type { z } from "zod";

type DatosCliente = z.infer<typeof esquemaCliente>;

async function registrarEvento(opts: {
  clienteId: string;
  tipo: string;
  titulo: string;
  detalle?: string;
  autor: UsuarioSesion;
}) {
  await db.eventoLineaTiempo.create({
    data: {
      clienteId: opts.clienteId,
      tipo: opts.tipo,
      titulo: opts.titulo,
      detalle: opts.detalle ?? null,
      autorId: opts.autor.id,
      autorNombre: opts.autor.nombre,
    },
  });
}

async function registrarAuditoria(opts: {
  usuario: UsuarioSesion;
  accion: string;
  recursoTipo: string;
  recursoId?: string;
  resumen: string;
}) {
  await db.registroAuditoria.create({
    data: {
      usuarioId: opts.usuario.id,
      accion: opts.accion,
      recursoTipo: opts.recursoTipo,
      recursoId: opts.recursoId ?? null,
      resumen: opts.resumen,
    },
  });
}

export async function crearCliente(usuario: UsuarioSesion, datos: DatosCliente) {
  const dueno = datos.vendedorId ?? usuario.id;

  // Prevención de duplicados
  if (datos.telefono || datos.correo) {
    const duplicado = await db.cliente.findFirst({
      where: {
        eliminadoEn: null,
        OR: [
          ...(datos.telefono ? [{ telefono: datos.telefono }] : []),
          ...(datos.correo ? [{ correo: datos.correo }] : []),
        ],
      },
      select: { id: true, nombre: true, telefono: true, correo: true },
    });
    if (duplicado) {
      const err: Error & { status?: number; duplicado?: unknown } = new Error(
        `Ya tienes a ${duplicado.nombre} con este teléfono o correo. ¿Abrir su ficha o crear uno nuevo?`,
      );
      err.status = 409;
      err.duplicado = duplicado;
      throw err;
    }
  }

  const c = await db.cliente.create({
    data: {
      nombre: datos.nombre,
      telefono: datos.telefono || null,
      correo: datos.correo || null,
      origen: datos.origen || null,
      etapa: datos.etapa ?? "NUEVO",
      temperatura: datos.temperatura ?? null,
      objecion: datos.objecion || null,
      valorEstimado: datos.valorEstimado ?? 0,
      servicioInteres: datos.servicioInteres || null,
      tipoContacto: datos.tipoContacto || null,
      notas: datos.notas || null,
      proximaAccion: datos.proximaAccion || null,
      proximaAccionEn: datos.proximaAccionEn,
      empresaNombre: datos.empresaNombre || null,
      empresaGiro: datos.empresaGiro || null,
      empresaPuesto: datos.empresaPuesto || null,
      empresaRfc: datos.empresaRfc || null,
      empresaSitioWeb: datos.empresaSitioWeb || null,
      empresaDireccion: datos.empresaDireccion || null,
      empresaTamano: datos.empresaTamano || null,
      empresaNotas: datos.empresaNotas || null,
      vendedorId: dueno,
      primerContacto: new Date(),
      ultimoContacto: new Date(),
    },
  });

  await registrarEvento({
    clienteId: c.id,
    tipo: "creacion",
    titulo: "Cliente creado",
    autor: usuario,
  });
  await registrarAuditoria({
    usuario,
    accion: "CREAR",
    recursoTipo: "Cliente",
    recursoId: c.id,
    resumen: `${usuario.nombre} creó al cliente ${c.nombre}`,
  });
  return c;
}

export async function actualizarCliente(
  usuario: UsuarioSesion,
  id: string,
  datos: Partial<DatosCliente>,
) {
  const actual = await db.cliente.findUnique({ where: { id } });
  if (!actual) {
    const err: Error & { status?: number } = new Error("Cliente no encontrado");
    err.status = 404;
    throw err;
  }
  exigirPermiso(usuario, "editar", actual);

  const cambios: string[] = [];
  if (datos.etapa && datos.etapa !== actual.etapa) {
    cambios.push(`Etapa: ${actual.etapa} → ${datos.etapa}`);
  }
  if (datos.temperatura !== undefined && datos.temperatura !== actual.temperatura) {
    cambios.push(`Temperatura: ${actual.temperatura ?? "—"} → ${datos.temperatura ?? "—"}`);
  }

  const c = await db.cliente.update({
    where: { id },
    data: {
      ...(datos.nombre !== undefined && { nombre: datos.nombre }),
      ...(datos.telefono !== undefined && { telefono: datos.telefono || null }),
      ...(datos.correo !== undefined && { correo: datos.correo || null }),
      ...(datos.origen !== undefined && { origen: datos.origen || null }),
      ...(datos.etapa !== undefined && { etapa: datos.etapa }),
      ...(datos.temperatura !== undefined && { temperatura: datos.temperatura }),
      ...(datos.objecion !== undefined && { objecion: datos.objecion || null }),
      ...(datos.valorEstimado !== undefined && { valorEstimado: datos.valorEstimado }),
      ...(datos.servicioInteres !== undefined && { servicioInteres: datos.servicioInteres || null }),
      ...(datos.notas !== undefined && { notas: datos.notas || null }),
      ...(datos.proximaAccion !== undefined && { proximaAccion: datos.proximaAccion || null }),
      ...(datos.proximaAccionEn !== undefined && { proximaAccionEn: datos.proximaAccionEn }),
      ...(datos.empresaNombre !== undefined && { empresaNombre: datos.empresaNombre || null }),
      ...(datos.empresaGiro !== undefined && { empresaGiro: datos.empresaGiro || null }),
      ...(datos.empresaPuesto !== undefined && { empresaPuesto: datos.empresaPuesto || null }),
      ...(datos.empresaRfc !== undefined && { empresaRfc: datos.empresaRfc || null }),
      ...(datos.empresaSitioWeb !== undefined && { empresaSitioWeb: datos.empresaSitioWeb || null }),
      ...(datos.empresaDireccion !== undefined && { empresaDireccion: datos.empresaDireccion || null }),
      ...(datos.empresaTamano !== undefined && { empresaTamano: datos.empresaTamano || null }),
      ...(datos.empresaNotas !== undefined && { empresaNotas: datos.empresaNotas || null }),
      ...(datos.vendedorId !== undefined && { vendedorId: datos.vendedorId }),
    },
  });
  if (cambios.length) {
    for (const ch of cambios) {
      await registrarEvento({
        clienteId: c.id,
        tipo: "cambio",
        titulo: ch,
        autor: usuario,
      });
    }
  }
  await registrarAuditoria({
    usuario,
    accion: "EDITAR",
    recursoTipo: "Cliente",
    recursoId: c.id,
    resumen: `${usuario.nombre} editó a ${c.nombre}`,
  });
  return c;
}

export async function moverEtapa(
  usuario: UsuarioSesion,
  id: string,
  nuevaEtapa:
    | "NUEVO"
    | "CONTACTADO"
    | "CITA_AGENDADA"
    | "PROPUESTA_ENVIADA"
    | "SEGUIMIENTO"
    | "GANADO"
    | "PERDIDO",
) {
  const actual = await db.cliente.findUnique({ where: { id } });
  if (!actual) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "editar", actual);

  const c = await db.cliente.update({
    where: { id },
    data: { etapa: nuevaEtapa, ultimoContacto: new Date() },
  });
  await registrarEvento({
    clienteId: id,
    tipo: "etapa",
    titulo: `Movido a "${nuevaEtapa.replace(/_/g, " ").toLowerCase()}"`,
    autor: usuario,
  });
  await registrarAuditoria({
    usuario,
    accion: "EDITAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} movió a ${c.nombre} → ${nuevaEtapa}`,
  });
  return c;
}

export async function marcarGanado(usuario: UsuarioSesion, id: string) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "editar", c);

  const actualizado = await db.cliente.update({
    where: { id },
    data: { estadoCartera: "GANADO", etapa: "GANADO", resultadoFinal: "Ganado" },
  });
  await registrarEvento({
    clienteId: id,
    tipo: "estado",
    titulo: `🎉 Marcado como Ganado`,
    autor: usuario,
  });
  await registrarAuditoria({
    usuario,
    accion: "EDITAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} ganó a ${c.nombre}`,
  });
  return actualizado;
}

export async function marcarPerdido(
  usuario: UsuarioSesion,
  id: string,
  motivo: string,
) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "editar", c);
  const actualizado = await db.cliente.update({
    where: { id },
    data: {
      estadoCartera: "PERDIDO",
      etapa: "PERDIDO",
      motivoPerdida: motivo,
    },
  });
  await registrarEvento({
    clienteId: id,
    tipo: "estado",
    titulo: `Marcado como Perdido — ${motivo}`,
    autor: usuario,
  });
  await registrarAuditoria({
    usuario,
    accion: "EDITAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} marcó como perdido a ${c.nombre} (${motivo})`,
  });
  return actualizado;
}

export async function archivarCliente(usuario: UsuarioSesion, id: string) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "archivar", c);
  const actualizado = await db.cliente.update({
    where: { id },
    data: {
      etapaAnterior: c.etapa,
      estadoCartera: "ARCHIVADO",
    },
  });
  await registrarEvento({
    clienteId: id,
    tipo: "estado",
    titulo: "Archivado",
    autor: usuario,
  });
  await registrarAuditoria({
    usuario,
    accion: "ARCHIVAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} archivó a ${c.nombre}`,
  });
  return actualizado;
}

export async function restaurarCliente(usuario: UsuarioSesion, id: string) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "editar", c);
  const etapaPrev = c.etapaAnterior ?? "NUEVO";
  const actualizado = await db.cliente.update({
    where: { id },
    data: {
      estadoCartera: "ACTIVO",
      etapa: etapaPrev,
      etapaAnterior: null,
    },
  });
  await registrarEvento({
    clienteId: id,
    tipo: "estado",
    titulo: "Restaurado a activo",
    autor: usuario,
  });
  await registrarAuditoria({
    usuario,
    accion: "RESTAURAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} restauró a ${c.nombre}`,
  });
  return actualizado;
}

export async function reactivarCliente(usuario: UsuarioSesion, id: string) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "editar", c);
  const proxima = new Date();
  proxima.setDate(proxima.getDate() + 1);
  const actualizado = await db.cliente.update({
    where: { id },
    data: {
      estadoCartera: "ACTIVO",
      etapa: "NUEVO",
      motivoPerdida: null,
      proximaAccion: "Reenganchar — preguntar cómo ha estado",
      proximaAccionEn: proxima,
    },
  });
  await registrarEvento({
    clienteId: id,
    tipo: "estado",
    titulo: "Reactivado al embudo",
    autor: usuario,
  });
  return actualizado;
}

export async function borrarSoftCliente(usuario: UsuarioSesion, id: string) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "borrar", c);
  await db.cliente.update({
    where: { id },
    data: { eliminadoEn: new Date() },
  });
  await registrarAuditoria({
    usuario,
    accion: "BORRAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} envió a papelera a ${c.nombre}`,
  });
}

export async function restaurarDesdePapelera(usuario: UsuarioSesion, id: string) {
  const c = await db.cliente.findUnique({ where: { id } });
  if (!c) throw new Error("Cliente no encontrado");
  exigirPermiso(usuario, "restaurar", c);
  await db.cliente.update({ where: { id }, data: { eliminadoEn: null } });
  await registrarAuditoria({
    usuario,
    accion: "RESTAURAR",
    recursoTipo: "Cliente",
    recursoId: id,
    resumen: `${usuario.nombre} restauró desde papelera a ${c.nombre}`,
  });
}

export async function listarClientes(
  usuario: UsuarioSesion,
  opciones: {
    busqueda?: string;
    etapa?: string;
    estado?: string;
    temperatura?: string;
    vendedorId?: string;
    etiqueta?: string;
    proximaVencida?: boolean;
    favoritos?: boolean;
    ordenar?: string;
    pagina?: number;
    porPagina?: number;
  } = {},
) {
  const where: Record<string, unknown> = { eliminadoEn: null };
  const filtroDueno = filtroPorRol(usuario);
  Object.assign(where, filtroDueno);

  if (opciones.busqueda) {
    where.OR = [
      { nombre: { contains: opciones.busqueda } },
      { telefono: { contains: opciones.busqueda } },
      { correo: { contains: opciones.busqueda } },
      { empresaNombre: { contains: opciones.busqueda } },
    ];
  }
  if (opciones.etapa) where.etapa = opciones.etapa;
  if (opciones.estado) where.estadoCartera = opciones.estado;
  else where.estadoCartera = { not: "ARCHIVADO" }; // por defecto no archivados
  if (opciones.temperatura) where.temperatura = opciones.temperatura;
  if (opciones.vendedorId && usuario.rol === "ADMIN") where.vendedorId = opciones.vendedorId;
  if (opciones.proximaVencida) {
    where.proximaAccionEn = { lt: new Date() };
  }
  if (opciones.etiqueta) {
    where.etiquetas = { some: { etiqueta: { nombre: opciones.etiqueta } } };
  }
  if (opciones.favoritos) {
    where.favoritos = { some: { usuarioId: usuario.id } };
  }

  const porPagina = Math.min(opciones.porPagina ?? 25, 100);
  const pagina = Math.max(opciones.pagina ?? 1, 1);

  let orderBy: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">> = { creadoEn: "desc" };
  if (opciones.ordenar === "nombre") orderBy = { nombre: "asc" };
  else if (opciones.ordenar === "valor") orderBy = { valorEstimado: "desc" };
  else if (opciones.ordenar === "proxima") orderBy = { proximaAccionEn: "asc" };

  const [total, clientes] = await Promise.all([
    db.cliente.count({ where }),
    db.cliente.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      include: {
        vendedor: { select: { id: true, nombre: true } },
        etiquetas: { include: { etiqueta: true } },
        favoritos: { where: { usuarioId: usuario.id }, select: { id: true } },
      },
    }),
  ]);

  return { clientes, total, pagina, porPagina };
}

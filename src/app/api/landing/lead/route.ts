import { NextRequest } from "next/server";
import { manejar } from "@/lib/respuesta-api";
import { db } from "@/lib/db";
import { esquemaLeadLanding } from "@/lib/validaciones";

/**
 * Ruta PÚBLICA — recibe leads de la landing/páginas de agenda.
 * Anti-pérdida: si la creación del Cliente falla por cualquier razón,
 * se guarda el intento crudo en LeadCapturadoCrudo para no perderlo.
 */
export async function POST(req: NextRequest) {
  return manejar(async () => {
    const body = await req.json();
    const datos = esquemaLeadLanding.parse(body);

    let vendedorId: string | null = null;
    let origen = datos.origen || "Landing";
    if (datos.vendedorSlug) {
      const v = await db.usuario.findUnique({ where: { slugAgenda: datos.vendedorSlug } });
      if (v) {
        vendedorId = v.id;
        origen = `Agenda ${v.nombre}`;
      }
    }

    // Plan A: crear todo en transacción (cliente + cita + lead + auditoría)
    try {
      const cliente = await db.$transaction(async (tx) => {
        // Verificar duplicado por teléfono
        const dup = datos.telefono
          ? await tx.cliente.findFirst({
              where: { telefono: datos.telefono, eliminadoEn: null },
            })
          : null;
        const c = dup
          ? await tx.cliente.update({
              where: { id: dup.id },
              data: {
                ultimoContacto: new Date(),
                notas: dup.notas
                  ? `${dup.notas}\n[Nuevo intento landing] ${datos.mensaje || ""}`
                  : datos.mensaje || null,
              },
            })
          : await tx.cliente.create({
              data: {
                nombre: datos.nombre,
                telefono: datos.telefono || null,
                correo: datos.correo || null,
                origen,
                canalUtm: datos.canalUtm || null,
                etapa: "NUEVO",
                estadoCartera: "ACTIVO",
                notas: datos.mensaje || null,
                vendedorId,
                primerContacto: new Date(),
                proximaAccion: "Contactar en menos de 24 h",
                proximaAccionEn: new Date(Date.now() + 60 * 60 * 1000),
              },
            });

        await tx.eventoLineaTiempo.create({
          data: {
            clienteId: c.id,
            tipo: "creacion",
            titulo: dup ? "Volvió por la landing" : "Llegó por la landing",
            detalle: origen,
            autorNombre: "Sistema (landing)",
          },
        });

        // Cita opcional
        if (datos.fechaCitaIso && vendedorId) {
          await tx.cita.create({
            data: {
              clienteId: c.id,
              vendedorId,
              inicio: new Date(datos.fechaCitaIso),
              duracionMin: 30,
              estado: "AGENDADA",
              titulo: "Sesión exploratoria",
              nombreInvitado: datos.nombre,
              telefonoInvitado: datos.telefono,
              correoInvitado: datos.correo || null,
            },
          });
        }

        await tx.registroAuditoria.create({
          data: {
            accion: "CREAR",
            recursoTipo: "Cliente",
            recursoId: c.id,
            resumen: `Lead nuevo desde ${origen}: ${datos.nombre}`,
          },
        });

        return c;
      });
      return { ok: true, id: cliente.id };
    } catch (e) {
      // Plan B (anti-pérdida): guardar el intento sin romper
      const err = e as Error;
      await db.leadCapturadoCrudo.create({
        data: {
          nombre: datos.nombre,
          telefono: datos.telefono || null,
          correo: datos.correo || null,
          mensaje: datos.mensaje || null,
          origen,
          canalUtm: datos.canalUtm || null,
          procesado: false,
          errorProceso: err.message.slice(0, 200),
        },
      });
      // No re-lanzamos: el cliente final no pierde nada
      return { ok: true, fallback: true };
    }
  });
}

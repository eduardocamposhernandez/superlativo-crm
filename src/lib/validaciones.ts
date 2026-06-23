import { z } from "zod";

/** Teléfono: solo dígitos, 10-15 (con o sin lada). Vacío permitido. */
export const telefonoOpcional = z
  .string()
  .trim()
  .transform((s) => s.replace(/\D/g, ""))
  .refine((s) => s === "" || (s.length >= 10 && s.length <= 15), {
    message: "El teléfono debe tener 10 a 15 dígitos",
  });

export const correoOpcional = z
  .string()
  .trim()
  .toLowerCase()
  .transform((s) => s || "")
  .refine((s) => s === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), {
    message: "Correo no válido",
  });

export const esquemaCliente = z.object({
  nombre: z.string().trim().min(2, "Pon al menos 2 letras"),
  telefono: telefonoOpcional.optional().default(""),
  correo: correoOpcional.optional().default(""),
  origen: z.string().trim().optional().default(""),
  etapa: z
    .enum([
      "NUEVO",
      "CONTACTADO",
      "CITA_AGENDADA",
      "PROPUESTA_ENVIADA",
      "SEGUIMIENTO",
      "GANADO",
      "PERDIDO",
    ])
    .optional(),
  temperatura: z.enum(["CALIENTE", "TIBIO", "FRIO"]).nullable().optional(),
  objecion: z.string().trim().max(500).optional().default(""),
  valorEstimado: z.coerce.number().nonnegative("No puede ser negativo").default(0),
  servicioInteres: z.string().optional().default(""),
  tipoContacto: z.string().optional().default(""),
  notas: z.string().optional().default(""),
  proximaAccion: z.string().optional().default(""),
  proximaAccionEn: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  empresaNombre: z.string().optional().default(""),
  empresaGiro: z.string().optional().default(""),
  empresaPuesto: z.string().optional().default(""),
  empresaRfc: z.string().optional().default(""),
  empresaSitioWeb: z.string().optional().default(""),
  empresaDireccion: z.string().optional().default(""),
  empresaTamano: z.string().optional().default(""),
  empresaNotas: z.string().optional().default(""),
  vendedorId: z.string().optional().nullable(),
});

export const esquemaPago = z.object({
  clienteId: z.string().min(1),
  monto: z.coerce.number().positive("Debe ser mayor a 0"),
  moneda: z.string().default("MXN"),
  metodo: z.string().min(1, "Elige un método"),
  concepto: z.string().optional().default(""),
  estado: z.enum(["PENDIENTE", "PAGADO", "VENCIDO"]).default("PAGADO"),
  fechaPago: z.union([z.string(), z.date()]).optional().nullable(),
  fechaVencimiento: z.union([z.string(), z.date()]).optional().nullable(),
});

export const esquemaCita = z.object({
  clienteId: z.string().optional().nullable(),
  vendedorId: z.string().min(1),
  inicio: z.union([z.string(), z.date()]),
  duracionMin: z.coerce.number().int().positive().default(30),
  titulo: z.string().optional().default(""),
  notas: z.string().optional().default(""),
  nombreInvitado: z.string().optional().default(""),
  telefonoInvitado: telefonoOpcional.optional().default(""),
  correoInvitado: correoOpcional.optional().default(""),
});

export const esquemaLeadLanding = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre"),
  telefono: telefonoOpcional.refine((s) => s.length >= 10, {
    message: "Pon tu WhatsApp completo con lada",
  }),
  correo: correoOpcional.optional().default(""),
  mensaje: z.string().max(800).optional().default(""),
  origen: z.string().optional().default("Landing"),
  canalUtm: z.string().optional().default(""),
  fechaCitaIso: z.string().optional().default(""),
  vendedorSlug: z.string().optional().default(""),
});

export const esquemaLogin = z.object({
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .refine((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), "Correo no válido"),
  contrasena: z.string().min(1, "Pon tu contraseña"),
});

export const esquemaUsuario = z.object({
  nombre: z.string().trim().min(2),
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .refine((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), "Correo no válido"),
  contrasena: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .optional(),
  rol: z.enum(["ADMIN", "VENDEDOR", "SOLO_LECTURA"]),
  metaMensual: z.coerce.number().nonnegative().default(0),
  metaClientesMensual: z.coerce.number().int().nonnegative().default(0),
});

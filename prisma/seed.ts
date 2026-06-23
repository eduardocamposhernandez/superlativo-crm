/**
 * Seed de datos de ejemplo para SUPERLATIVO CRM.
 *
 * REGLA DE ORO: solo siembra si la base está VACÍA (o si pones SEED_FORCE=1).
 * Nunca pisa datos reales.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

type EtapaEmbudo = "NUEVO" | "CONTACTADO" | "CITA_AGENDADA" | "PROPUESTA_ENVIADA" | "SEGUIMIENTO" | "GANADO" | "PERDIDO";
type EstadoCartera = "ACTIVO" | "GANADO" | "PERDIDO" | "ARCHIVADO";
type Temperatura = "CALIENTE" | "TIBIO" | "FRIO";

const db = new PrismaClient();

const NOMBRES = [
  "Laura Méndez", "Carlos Vázquez", "Daniel Romero", "Ana Torres", "Pedro García",
  "María Rodríguez", "Jorge López", "Sofía Hernández", "Miguel Pérez", "Andrea Silva",
  "Roberto Aguilar", "Patricia Morales",
];
const EMPRESAS = ["Confitec MX", "Grupo Diamante", "Estudio Norte", "Independiente", "Talleres La Luz", "EduPro", null, null, "Centro Médico León", null, "Bufete RJ", "Constructora El Roble"];
const ORIGENES = ["Instagram", "Recomendado", "Landing", "Facebook", "WhatsApp", "Evento", "Recomendado", "Instagram"];
const OBJECIONES = ["Está caro", "Lo voy a pensar", "No es buen momento", "Quiero comparar con otra opción", null];

function al<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rango(min: number, max: number): number { return Math.floor(min + Math.random() * (max - min)); }
function diasAtras(d: number): Date { return new Date(Date.now() - d * 86400000); }

async function main() {
  const force = process.env.SEED_FORCE === "1";
  const yaHayUsuarios = await db.usuario.count();
  if (yaHayUsuarios > 0 && !force) {
    console.log("✋ La base ya tiene datos. Saltando seed. (Pon SEED_FORCE=1 para forzar.)");
    return;
  }

  console.log("🌱 Sembrando datos de ejemplo…");

  // Configuración
  await db.configuracion.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      nombreNegocio: "SUPERLATIVO",
      colorMarca: "#3fbf8f",
      monedaPrincipal: "MXN",
      zonaHoraria: "America/Mexico_City",
      horarioInicio: "09:00",
      horarioFin: "18:00",
      duracionCitaMin: 30,
      metaMensual: 30000,
      metaClientesMensual: 5,
      metodosPago: "Transferencia,Tarjeta,Liga de pago (Stripe/Mercado Pago)",
      motivosPerdida: "Está caro,Lo voy a pensar,No es buen momento,Se fue con la competencia,No calificaba,Otro",
      mensajeWhatsApp: "Hola, [Nombre]. Soy Eduardo Campos, de Superlativo.\n\nGracias por escribirme. Este es un espacio para encontrar claridad, ordenar decisiones importantes y construir mejores caminos de vida.\n\nCuéntame brevemente qué situación te gustaría trabajar y con gusto te oriento sobre el siguiente paso.",
      ciudadNegocio: "León, Guanajuato",
    },
  });

  // Usuarios: admin (Eduardo) y un vendedor de muestra
  const hashAdmin = await bcrypt.hash("admin123", 12);
  const hashVend = await bcrypt.hash("vendedor123", 12);

  const admin = await db.usuario.create({
    data: {
      nombre: "Eduardo Campos",
      correo: "lalocamp@gmail.com",
      contrasenaHash: hashAdmin,
      rol: "ADMIN",
      slugAgenda: "eduardo",
      metaMensual: 30000,
      metaClientesMensual: 5,
      onboardingCompletado: false,
    },
  });

  const vendedora = await db.usuario.create({
    data: {
      nombre: "María Ruiz",
      correo: "maria@superlativo.com",
      contrasenaHash: hashVend,
      rol: "VENDEDOR",
      slugAgenda: "maria",
      metaMensual: 20000,
      metaClientesMensual: 3,
    },
  });

  // Etiquetas
  const vip = await db.etiqueta.create({ data: { nombre: "VIP", color: "#dc2626" } });
  const referido = await db.etiqueta.create({ data: { nombre: "Referido", color: "#3fbf8f" } });
  const anticipo = await db.etiqueta.create({ data: { nombre: "Pagó anticipo", color: "#0284c7" } });

  // Plantillas del sistema
  await db.plantilla.createMany({
    data: [
      {
        nombre: "Confirmar cita",
        canal: "whatsapp",
        cuerpo: "Hola {nombre}, confirmo nuestra cita de mañana. ¿Quedamos a la hora acordada? Te mando la liga del Meet.",
        etapa: "CITA_AGENDADA",
      },
      {
        nombre: "Vencer 'está caro'",
        canal: "whatsapp",
        cuerpo: "Hola {nombre}, entiendo lo del precio. Lo que hacemos en Superlativo es transformación real, y tengo dos formas de hacerlo más accesible (paquete o parcialidades). ¿Te late que te las muestre hoy?",
        objecion: "Está caro",
      },
      {
        nombre: "Pedir el sí final",
        canal: "whatsapp",
        cuerpo: "Hola {nombre}, ya te mandé toda la información. ¿Lo dejamos cerrado hoy o esperamos al lunes? Te aviso por si hay cupo limitado.",
        etapa: "PROPUESTA_ENVIADA",
      },
      {
        nombre: "Reactivar frío",
        canal: "whatsapp",
        cuerpo: "Hola {nombre}, retomo. Sé que hace tiempo no hablamos. ¿Cómo estás con la decisión que estabas considerando? Si quieres lo conversamos 10 min sin compromiso.",
      },
      {
        nombre: "Cobrar pago vencido",
        canal: "whatsapp",
        cuerpo: "Hola {nombre}, recordatorio amable: tienes pendiente el pago de {valor}. ¿Te ayudo con la liga o transferencia?",
      },
      {
        nombre: "Pedir referidos",
        canal: "whatsapp",
        cuerpo: "Hola {nombre}, qué bueno que el proceso te haya servido. ¿Conoces a alguien que también podría beneficiarse? Si me pasas su contacto, le doy condiciones especiales.",
      },
    ],
  });

  // Clientes — repartidos en estados y a lo largo de 6 meses
  const ETAPAS: EtapaEmbudo[] = ["NUEVO", "CONTACTADO", "CITA_AGENDADA", "PROPUESTA_ENVIADA", "SEGUIMIENTO", "SEGUIMIENTO"];
  const TEMPS: Temperatura[] = ["CALIENTE", "TIBIO", "FRIO", "TIBIO", "CALIENTE"];

  const clientes = await Promise.all(
    NOMBRES.map(async (nombre, i) => {
      const dueno = i % 4 === 0 ? vendedora.id : admin.id;
      const esGanado = i === 0;
      const esPerdido = i === 1;
      const esArchivado = i === 2;
      const estado: EstadoCartera = esGanado ? "GANADO" : esPerdido ? "PERDIDO" : esArchivado ? "ARCHIVADO" : "ACTIVO";
      const etapa: EtapaEmbudo = esGanado ? "GANADO" : esPerdido ? "PERDIDO" : ETAPAS[i % ETAPAS.length];
      const haceDias = rango(0, 180);
      const proxima = i % 3 === 0 ? diasAtras(rango(-3, 5)) : null;
      const c = await db.cliente.create({
        data: {
          nombre,
          telefono: `52477${String(rango(1000000, 9999999)).slice(0, 7)}`,
          correo: `${nombre.toLowerCase().replace(/[^a-z]+/g, ".")}@ejemplo.mx`,
          empresaNombre: EMPRESAS[i % EMPRESAS.length],
          empresaPuesto: EMPRESAS[i % EMPRESAS.length] ? "Director general" : null,
          origen: al(ORIGENES),
          etapa,
          estadoCartera: estado,
          temperatura: estado === "ACTIVO" ? TEMPS[i % TEMPS.length] : null,
          objecion: al(OBJECIONES),
          valorEstimado: rango(6, 25) * 1000,
          servicioInteres: i % 2 === 0 ? "Mentoría 1-a-1" : "Taller en empresa",
          notas: `Lead de muestra. Estado inicial ${estado}. Llegó por ${al(ORIGENES)}.`,
          vendedorId: dueno,
          primerContacto: diasAtras(haceDias),
          ultimoContacto: diasAtras(Math.max(0, haceDias - rango(0, 30))),
          proximaAccion: proxima ? "Llamar para cerrar" : null,
          proximaAccionEn: proxima,
          motivoPerdida: esPerdido ? "Está caro" : null,
          creadoEn: diasAtras(haceDias),
          actualizadoEn: esGanado || esPerdido ? diasAtras(rango(0, 90)) : diasAtras(rango(0, 30)),
        },
      });

      // Etiquetas
      if (i % 4 === 0) await db.etiquetaEnCliente.create({ data: { clienteId: c.id, etiquetaId: vip.id } });
      if (i % 5 === 0) await db.etiquetaEnCliente.create({ data: { clienteId: c.id, etiquetaId: referido.id } });

      // Eventos básicos
      await db.eventoLineaTiempo.create({
        data: { clienteId: c.id, tipo: "creacion", titulo: "Cliente creado", autorNombre: "Sistema (seed)" },
      });
      if (esGanado) {
        await db.eventoLineaTiempo.create({
          data: { clienteId: c.id, tipo: "estado", titulo: "🎉 Marcado como Ganado", autorNombre: "Eduardo Campos" },
        });
      }

      return c;
    }),
  );

  // Pagos: repartidos a lo largo de 6 meses para que la gráfica se vea con tendencia
  for (let m = 5; m >= 0; m--) {
    const ini = new Date();
    ini.setMonth(ini.getMonth() - m, 1);
    const numPagos = rango(2, 5) + (5 - m); // tendencia ascendente
    for (let j = 0; j < numPagos; j++) {
      const c = al(clientes);
      const monto = rango(3, 15) * 1000;
      const dia = rango(1, 28);
      const fecha = new Date(ini.getFullYear(), ini.getMonth(), dia);
      await db.pago.create({
        data: {
          clienteId: c.id,
          monto,
          moneda: "MXN",
          metodo: al(["Transferencia", "Tarjeta", "Liga de pago (Stripe/Mercado Pago)"]),
          estado: "PAGADO",
          fechaPago: fecha,
          concepto: al(["Sesión 1 de 4", "Anticipo", "Pago completo", "Taller"]),
          registradoPorId: admin.id,
          creadoEn: fecha,
        },
      });
    }
  }

  // Un pago vencido y un cliente con parcialidades
  await db.pago.create({
    data: {
      clienteId: clientes[3].id,
      monto: 5000,
      moneda: "MXN",
      metodo: "Transferencia",
      estado: "VENCIDO",
      fechaVencimiento: diasAtras(5),
      concepto: "Saldo pendiente",
      registradoPorId: admin.id,
    },
  });

  // Citas: pasadas y futuras
  for (let i = 0; i < 5; i++) {
    const c = clientes[i];
    const futura = i < 3;
    const cuando = futura ? new Date(Date.now() + rango(1, 14) * 86400000) : diasAtras(rango(1, 30));
    cuando.setHours(rango(9, 17), 0, 0, 0);
    await db.cita.create({
      data: {
        clienteId: c.id,
        vendedorId: c.vendedorId!,
        inicio: cuando,
        duracionMin: 30,
        titulo: "Sesión exploratoria",
        estado: futura ? "AGENDADA" : "REALIZADA",
      },
    });
  }

  // Recordatorios
  await db.recordatorio.create({
    data: {
      usuarioId: admin.id,
      clienteId: clientes[4].id,
      texto: "Llamar para confirmar propuesta",
      cuando: new Date(Date.now() + 86400000),
    },
  });

  console.log("✅ Seed listo:");
  console.log("   Admin:    lalocamp@gmail.com / admin123");
  console.log("   Vendedor: maria@superlativo.com / vendedor123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

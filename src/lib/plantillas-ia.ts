/**
 * Plantillas de respaldo locales para cuando NO hay ANTHROPIC_API_KEY
 * o la API falla. Permiten que las 5 funciones del asistente sigan
 * funcionando con respuestas razonables, sin romper el CRM.
 */

interface ClienteCtx {
  nombre: string;
  etapa?: string | null;
  temperatura?: string | null;
  objecion?: string | null;
  ultimoContacto?: Date | string | null;
  valorEstimado?: number;
  servicioInteres?: string | null;
}

export function plantillaMensaje(c: ClienteCtx, canal: "whatsapp" | "correo"): string {
  const obj = (c.objecion || "").toLowerCase();
  const intro = canal === "whatsapp" ? "Hola" : "Estimado/a";
  const cierre = canal === "whatsapp" ? "¿Te late agendar hoy?" : "Quedo a la espera de tu confirmación.";

  if (obj.includes("caro") || obj.includes("precio")) {
    return `${intro} ${c.nombre}, gracias por compartirme tu inquietud sobre la inversión. Entiendo perfectamente. Lo que cobramos en Superlativo es por la transformación que logras: mayor claridad, mejores decisiones y reinvención. Tengo dos formas de hacértelo más accesible (paquete o en partes). ${cierre}`;
  }
  if (obj.includes("pensar")) {
    return `${intro} ${c.nombre}, sé que es una decisión importante. Para que tengas todo claro: ¿qué dudas concretas tienes para resolverlas hoy? Cuanto antes empieces, antes ves resultados. ${cierre}`;
  }
  if (obj.includes("momento") || obj.includes("tiempo")) {
    return `${intro} ${c.nombre}, te entiendo. Si te late, podemos arrancar con una sesión corta sin compromiso esta semana; el proceso te marca el ritmo. ${cierre}`;
  }
  return `${intro} ${c.nombre}, retomo nuestra conversación de Superlativo. Me encantaría escucharte 15 minutos para entender mejor en qué momento estás y ver si esta es la siguiente decisión que te corresponde. ${cierre}`;
}

export function plantillaTemperatura(c: ClienteCtx): { temperatura: "CALIENTE" | "TIBIO" | "FRIO"; razon: string } {
  if (c.etapa === "PROPUESTA_ENVIADA" || c.etapa === "CITA_AGENDADA")
    return { temperatura: "CALIENTE", razon: "Está en etapa de cierre — atiéndelo hoy." };
  if (c.etapa === "CONTACTADO" || c.etapa === "SEGUIMIENTO")
    return { temperatura: "TIBIO", razon: "Avanzando pero sin compromiso aún." };
  return { temperatura: "FRIO", razon: "Apenas conoce — necesita más contexto." };
}

export function plantillaProximaAccion(c: ClienteCtx): { texto: string; cuandoDias: number } {
  switch (c.etapa) {
    case "NUEVO":
      return { texto: "Hacer primer contacto por WhatsApp", cuandoDias: 0 };
    case "CONTACTADO":
      return { texto: "Agendar cita exploratoria", cuandoDias: 2 };
    case "CITA_AGENDADA":
      return { texto: "Confirmar la cita y enviar Meet", cuandoDias: 1 };
    case "PROPUESTA_ENVIADA":
      return { texto: "Llamar para cerrar — pedir el sí final", cuandoDias: 2 };
    case "SEGUIMIENTO":
      return { texto: "Reenganchar con un mensaje cálido o caso de éxito", cuandoDias: 3 };
    default:
      return { texto: "Hacer seguimiento", cuandoDias: 2 };
  }
}

export function plantillaResumen(c: ClienteCtx, notas: string[]): string {
  const partes = [
    `${c.nombre} — etapa ${(c.etapa ?? "—").replace(/_/g, " ").toLowerCase()}.`,
    c.servicioInteres ? `Interés: ${c.servicioInteres}.` : "",
    c.temperatura ? `Temperatura: ${c.temperatura.toLowerCase()}.` : "",
    c.objecion ? `Objeción registrada: "${c.objecion}".` : "",
    notas.length ? `Última nota: ${notas[0].slice(0, 140)}…` : "",
    `Siguiente: orientado a cerrar el siguiente paso (cita o propuesta).`,
  ].filter(Boolean);
  return partes.join(" ");
}

export function plantillaObjecion(objecion: string): string {
  const o = objecion.toLowerCase();
  if (o.includes("caro") || o.includes("precio")) {
    return 'Reconoce sin disculparte: "Te entiendo, es una inversión real". Luego pivota al valor concreto que recibe (claridad, decisiones, tiempo recuperado). Cierra con una opción más accesible (parcialidades o paquete) y un sí/no claro: "¿Te late que lo arranquemos así?"';
  }
  if (o.includes("pensar")) {
    return 'No lo presiones, pero tampoco lo dejes ir frío. Pregunta: "Para ayudarte a pensarlo mejor, ¿qué dudas concretas te quedan?". Lleva la conversación a esas dudas específicas y plantéale los próximos 7 días como ventana de decisión.';
  }
  if (o.includes("momento") || o.includes("tiempo")) {
    return 'Valida: "Te entiendo, el momento importa". Pero pivota: "¿Y si arrancamos chico para no perder el impulso? Una sesión corta sin compromiso esta semana". Lo importante es no perder el contacto: ponle una fecha concreta de revisión.';
  }
  if (o.includes("competencia") || o.includes("otra")) {
    return "Pregunta qué le atrajo de la otra opción (sin descalificarla). Pivota al diferencial real de Superlativo (acompañamiento personalizado, proceso de claridad). Ofrece un valor extra para inclinar la balanza.";
  }
  return 'Repite la objeción para validar: "Lo que me dices es X, ¿correcto?". Después ofrece la solución concreta o el siguiente paso pequeño que reduce el riesgo. Cierra con una pregunta de decisión.';
}

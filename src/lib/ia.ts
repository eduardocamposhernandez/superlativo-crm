/**
 * Cliente para la API de Claude (Anthropic).
 *
 * Reglas:
 *   - La llave SOLO vive en el servidor, en ANTHROPIC_API_KEY.
 *   - Si no hay llave o falla, devuelve null (caller cae a plantillas).
 *   - El nombre del modelo está en UNA constante fácil de cambiar.
 */

import {
  plantillaMensaje,
  plantillaObjecion,
  plantillaProximaAccion,
  plantillaResumen,
  plantillaTemperatura,
} from "./plantillas-ia";

// Modelo económico de Anthropic — verificable en console.anthropic.com.
// Si quieres más potencia, cambia a "claude-opus-4-5" o el actual.
const MODELO = "claude-haiku-4-5-20251001";

interface ClienteCtx {
  nombre: string;
  etapa?: string | null;
  temperatura?: string | null;
  objecion?: string | null;
  ultimoContacto?: Date | string | null;
  valorEstimado?: number;
  servicioInteres?: string | null;
}

async function llamarClaude(prompt: string, sistema: string): Promise<string | null> {
  const llave = process.env.ANTHROPIC_API_KEY;
  if (!llave) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": llave,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 600,
        system: sistema,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const texto = j?.content?.[0]?.text;
    return typeof texto === "string" ? texto : null;
  } catch {
    return null;
  }
}

const PERSONA = `Eres un coach senior de ventas de "Superlativo" (mentoría y procesos de claridad personal en León, Guanajuato). Hablas en español MX, cálido y directo, sin clichés ni emojis exagerados. Tu objetivo es ayudar a Eduardo a cerrar la siguiente venta sin perder el toque humano.`;

export async function iaRedactarMensaje(
  c: ClienteCtx,
  canal: "whatsapp" | "correo",
  plantillaBase: string,
): Promise<string> {
  const prompt = `Cliente: ${c.nombre}
Etapa: ${c.etapa ?? "—"}
Temperatura: ${c.temperatura ?? "—"}
Objeción: ${c.objecion ?? "ninguna registrada"}
Servicio interés: ${c.servicioInteres ?? "—"}
Plantilla base del vendedor: "${plantillaBase}"

Redacta UN mensaje breve por ${canal} (máx 90 palabras) personalizado al cliente, orientado a moverlo a la siguiente etapa. Sin saludos genéricos vacíos; lleva al siguiente paso con una pregunta de cierre.`;
  const r = await llamarClaude(prompt, PERSONA);
  return r ?? plantillaMensaje(c, canal);
}

export async function iaClasificarTemperatura(c: ClienteCtx, notas: string[]) {
  const prompt = `Cliente: ${c.nombre}
Etapa: ${c.etapa ?? "—"}
Objeción: ${c.objecion ?? "ninguna"}
Últimas notas: ${notas.slice(0, 3).join(" | ") || "ninguna"}

Clasifica la temperatura como CALIENTE, TIBIO o FRIO. Responde SOLO en JSON: {"temperatura":"CALIENTE","razon":"frase corta"}`;
  const r = await llamarClaude(prompt, PERSONA);
  if (r) {
    try {
      const m = r.match(/\{[\s\S]*\}/);
      if (m) {
        const j = JSON.parse(m[0]);
        if (["CALIENTE", "TIBIO", "FRIO"].includes(j.temperatura)) return j;
      }
    } catch {
      /* */
    }
  }
  return plantillaTemperatura(c);
}

export async function iaSugerirAccion(c: ClienteCtx) {
  const prompt = `Cliente ${c.nombre}, etapa ${c.etapa}, objeción ${c.objecion ?? "ninguna"}.
Sugiere UNA próxima acción concreta y en cuántos días. Responde en JSON: {"texto":"...", "cuandoDias":3}`;
  const r = await llamarClaude(prompt, PERSONA);
  if (r) {
    try {
      const m = r.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
    } catch {
      /* */
    }
  }
  return plantillaProximaAccion(c);
}

export async function iaResumir(c: ClienteCtx, notas: string[]): Promise<string> {
  const prompt = `Resume en 3-5 líneas el estado de venta con ${c.nombre}.
Etapa: ${c.etapa}. Temperatura: ${c.temperatura ?? "—"}. Objeción: ${c.objecion ?? "—"}.
Notas:
${notas.slice(0, 5).map((n) => `- ${n}`).join("\n") || "- (sin notas)"}

Incluye: situación, objeción si la hay, dónde quedó y siguiente paso recomendado.`;
  const r = await llamarClaude(prompt, PERSONA);
  return r ?? plantillaResumen(c, notas);
}

export async function iaManejarObjecion(objecion: string, c: ClienteCtx): Promise<string> {
  const prompt = `El cliente ${c.nombre} dijo: "${objecion}".
Servicio: ${c.servicioInteres ?? "Mentoría Superlativo"}.
Da una respuesta concreta para manejar esa objeción y un siguiente paso accionable. Máximo 6 líneas.`;
  const r = await llamarClaude(prompt, PERSONA);
  return r ?? plantillaObjecion(objecion);
}

export function iaActivada(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

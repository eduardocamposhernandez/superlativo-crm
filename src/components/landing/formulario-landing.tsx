"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Send, MessageCircle, Loader2 } from "lucide-react";

interface Props {
  canal: string;
  vendedorSlug?: string;
  horarioInicio: string;
  horarioFin: string;
  duracionMin: number;
}

const CLAVE_PENDIENTE = "superlativo-lead-pendiente";
const WHATSAPP = "5214772177331";

export function FormularioLanding({
  canal,
  vendedorSlug,
  horarioInicio,
  horarioFin,
  duracionMin,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaCita, setFechaCita] = useState("");
  const [horaCita, setHoraCita] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  // Reintentar si hay un lead pendiente del intento anterior (anti-pérdida)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE_PENDIENTE);
      if (!raw) return;
      const datos = JSON.parse(raw);
      enviar(datos, true);
    } catch {
      /* */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generarSlots() {
    const [hi, mi] = horarioInicio.split(":").map(Number);
    const [hf, mf] = horarioFin.split(":").map(Number);
    let mins = hi * 60 + mi;
    const finMins = hf * 60 + mf;
    const slots: string[] = [];
    while (mins + duracionMin <= finMins) {
      slots.push(
        `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`,
      );
      mins += duracionMin;
    }
    return slots;
  }

  async function enviar(predefinido?: Record<string, unknown>, esReintento = false) {
    setError(null);
    if (!esReintento) setCargando(true);
    const datos =
      predefinido ?? {
        nombre,
        telefono,
        correo,
        mensaje,
        origen: canal || "Landing",
        canalUtm: canal,
        vendedorSlug: vendedorSlug ?? "",
        fechaCitaIso:
          fechaCita && horaCita
            ? new Date(`${fechaCita}T${horaCita}:00`).toISOString()
            : "",
      };
    try {
      localStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(datos));
    } catch {
      /* */
    }

    try {
      const r = await fetch("/api/landing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const j = await r.json();
      if (!j.ok) {
        setError(j.mensaje || "No pudimos enviar tu mensaje");
        setCargando(false);
        return;
      }
      try {
        localStorage.removeItem(CLAVE_PENDIENTE);
      } catch {
        /* */
      }
      setEnviado(true);
      setCargando(false);
    } catch {
      setError("Sin conexión — guardamos tu información y la enviaremos cuando regrese");
      setCargando(false);
    }
  }

  if (enviado) {
    const nombreTxt = nombre ? nombre.split(" ")[0] : "";
    return (
      <div className="space-y-4 rounded-xl border border-lima-500/30 bg-lima-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-lima-400" />
        <h3 className="font-serif text-2xl text-white">
          Gracias{nombreTxt ? `, ${nombreTxt}` : ""}.
        </h3>
        <p className="text-sm text-white/70">
          Recibí tu mensaje. Te contacto en menos de 24 horas para coordinar nuestra conversación.
          {fechaCita && horaCita && (
            <>
              {" "}
              Confirmaré la cita del <strong className="text-white">{fechaCita}</strong> a las{" "}
              <strong className="text-white">{horaCita}</strong>.
            </>
          )}
        </p>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            `Hola Eduardo, soy ${nombre || "..."} y acabo de llenar el formulario en superlativo.net.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="boton-lima inline-flex"
        >
          <MessageCircle className="h-4 w-4" /> Escríbeme ya por WhatsApp
        </a>
      </div>
    );
  }

  const campoBase =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-lima-500/50 focus:outline-none focus:ring-2 focus:ring-lima-500/20";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="space-y-3"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="ln-nombre">
          Tu nombre
        </label>
        <input
          id="ln-nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={campoBase}
          placeholder="Cómo te llamas"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="ln-tel">
          WhatsApp
        </label>
        <input
          id="ln-tel"
          required
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={campoBase}
          placeholder="33 1234 5678"
        />
      </div>

      <details className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <summary className="cursor-pointer text-sm font-medium text-white/80">
          Quiero proponer una fecha y hora
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/60" htmlFor="ln-fecha">
              Fecha
            </label>
            <input
              id="ln-fecha"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={fechaCita}
              onChange={(e) => setFechaCita(e.target.value)}
              className={campoBase}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/60" htmlFor="ln-hora">
              Hora
            </label>
            <select
              id="ln-hora"
              value={horaCita}
              onChange={(e) => setHoraCita(e.target.value)}
              className={campoBase}
            >
              <option value="">Elige</option>
              {generarSlots().map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>

      <details className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <summary className="cursor-pointer text-sm font-medium text-white/80">
          Añadir correo (opcional)
        </summary>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className={`${campoBase} mt-2`}
          placeholder="tu@correo.com"
        />
      </details>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/80" htmlFor="ln-msg">
          ¿Qué te gustaría trabajar? (opcional)
        </label>
        <textarea
          id="ln-msg"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className={`${campoBase} min-h-[90px]`}
          placeholder="Cuéntame brevemente tu situación"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200"
        >
          {error}
        </div>
      )}

      <button type="submit" disabled={cargando} className="boton-lima w-full disabled:opacity-60">
        {cargando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Enviar y agendar conversación
          </>
        )}
      </button>
      <p className="text-center text-xs text-white/40">
        Te contacto en menos de 24 horas. Sin compromiso.
      </p>
    </form>
  );
}

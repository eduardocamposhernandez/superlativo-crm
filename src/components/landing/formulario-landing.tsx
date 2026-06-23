"use client";

import { useState, useEffect } from "react";
import { Boton } from "@/components/ui/boton";
import { CheckCircle2, Send, MessageCircle } from "lucide-react";

interface Props {
  canal: string;
  vendedorSlug?: string;
  horarioInicio: string;
  horarioFin: string;
  duracionMin: number;
}

const CLAVE_PENDIENTE = "superlativo-lead-pendiente";

export function FormularioLanding({ canal, vendedorSlug, horarioInicio, horarioFin, duracionMin }: Props) {
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
      slots.push(`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
      mins += duracionMin;
    }
    return slots;
  }

  async function enviar(predefinido?: Record<string, unknown>, esReintento = false) {
    setError(null);
    if (!esReintento) setCargando(true);
    const datos = predefinido ?? {
      nombre,
      telefono,
      correo,
      mensaje,
      origen: canal || "Landing",
      canalUtm: canal,
      vendedorSlug: vendedorSlug ?? "",
      fechaCitaIso: fechaCita && horaCita ? new Date(`${fechaCita}T${horaCita}:00`).toISOString() : "",
    };

    // Anti-pérdida: guardar antes de enviar
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
      // No tiramos el dato — queda guardado en localStorage para reintento
      setError("Sin conexión — guardamos tu info y la enviamos cuando regrese");
      setCargando(false);
    }
  }

  if (enviado) {
    return (
      <div className="space-y-4 rounded-xl border border-marca-200 bg-marca-50 p-6 text-center dark:bg-marca-500/10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-marca-600" />
        <h3 className="text-xl font-bold text-marca-700 dark:text-marca-300">¡Listo!</h3>
        <p className="text-sm text-texto">
          Te contactamos en menos de 24 horas
          {fechaCita && horaCita && (
            <>
              {" "}
              y confirmamos tu cita del <strong>{fechaCita}</strong> a las <strong>{horaCita}</strong>
            </>
          )}
          . Mientras tanto:
        </p>
        <a
          href={`https://wa.me/5214772177331?text=${encodeURIComponent(
            `Hola, soy ${nombre}, acabo de llenar el formulario de Superlativo. Quiero saber más.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="boton boton-primario inline-flex"
        >
          <MessageCircle className="h-4 w-4" /> Escríbenos ya por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="space-y-3"
    >
      <div>
        <label className="etiqueta-campo" htmlFor="ln-nombre">Tu nombre</label>
        <input
          id="ln-nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="campo"
          placeholder="Cómo te llamas"
        />
      </div>
      <div>
        <label className="etiqueta-campo" htmlFor="ln-tel">WhatsApp</label>
        <input
          id="ln-tel"
          required
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="campo"
          placeholder="33 1234 5678"
        />
      </div>
      <details className="rounded-xl border border-borde p-3">
        <summary className="cursor-pointer text-sm font-medium text-texto">
          Quiero agendar una cita ahora
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="etiqueta-campo" htmlFor="ln-fecha">Fecha</label>
            <input
              id="ln-fecha"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={fechaCita}
              onChange={(e) => setFechaCita(e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="etiqueta-campo" htmlFor="ln-hora">Hora</label>
            <select
              id="ln-hora"
              value={horaCita}
              onChange={(e) => setHoraCita(e.target.value)}
              className="campo"
            >
              <option value="">Elige</option>
              {generarSlots().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </details>
      <details className="rounded-xl border border-borde p-3">
        <summary className="cursor-pointer text-sm font-medium text-texto">
          Agregar correo (opcional)
        </summary>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="campo mt-2"
          placeholder="tu@correo.com"
        />
      </details>
      <div>
        <label className="etiqueta-campo" htmlFor="ln-msg">¿Qué te gustaría trabajar? (opcional)</label>
        <textarea
          id="ln-msg"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="campo min-h-[80px]"
          placeholder="Cuéntame brevemente tu situación"
        />
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-aviso/30 bg-aviso-suave p-3 text-xs text-aviso dark:bg-aviso/10">
          {error}
        </div>
      )}
      <Boton type="submit" bloque cargando={cargando} iconoIzq={<Send className="h-4 w-4" />}>
        Enviar y agendar
      </Boton>
      <p className="text-center text-xs text-texto-tenue">Te contactamos en menos de 24 horas. Sin compromiso.</p>
    </form>
  );
}

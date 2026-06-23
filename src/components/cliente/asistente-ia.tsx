"use client";

import { useState } from "react";
import { Sparkles, MessageCircle, Mail, Thermometer, Lightbulb, FileText, Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Boton } from "@/components/ui/boton";
import { useToast } from "@/components/ui/toast";

interface ClienteMin {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  objecion: string | null;
}

export function AsistenteIA({
  abierto,
  alCerrar,
  cliente,
}: {
  abierto: boolean;
  alCerrar: () => void;
  cliente: ClienteMin;
}) {
  const toast = useToast();
  const [accion, setAccion] = useState<string | null>(null);
  const [salida, setSalida] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [iaActiva, setIaActiva] = useState<boolean | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"whatsapp" | "correo">("whatsapp");

  async function ejecutar(a: string, extras: Record<string, unknown> = {}) {
    setAccion(a);
    setCargando(true);
    setSalida(null);
    const r = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: a, clienteId: cliente.id, ...extras }),
    });
    const j = await r.json();
    setCargando(false);
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    setIaActiva(j.data.iaActiva);
    if (typeof j.data.resultado === "string") setSalida(j.data.resultado);
    else if (j.data.resultado?.texto) setSalida(`${j.data.resultado.texto} · En ${j.data.resultado.cuandoDias} días`);
    else if (j.data.resultado?.temperatura)
      setSalida(`${j.data.resultado.temperatura} — ${j.data.resultado.razon}`);
    else setSalida(JSON.stringify(j.data.resultado));
  }

  function abrirWhats() {
    if (!cliente.telefono || !salida) return;
    const url = `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(salida)}`;
    window.open(url, "_blank");
  }
  function abrirCorreo() {
    if (!cliente.correo || !salida) return;
    const url = `mailto:${cliente.correo}?subject=${encodeURIComponent(`Seguimiento — ${cliente.nombre}`)}&body=${encodeURIComponent(salida)}`;
    window.location.href = url;
  }
  async function copiar() {
    if (!salida) return;
    await navigator.clipboard.writeText(salida);
    toast.exito("Copiado al portapapeles ✓");
  }

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo="Asistente IA — tu copiloto" anchoMax="lg">
      <div className="space-y-4">
        {iaActiva === false && (
          <div className="rounded-xl border border-info/30 bg-info-suave p-3 text-xs text-info dark:bg-info/10">
            Estás usando plantillas locales. Pon tu <code>ANTHROPIC_API_KEY</code> para respuestas
            más personalizadas. Mientras tanto, esto sigue funcionando.
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Boton
            variante={accion === "mensaje" ? "primario" : "secundario"}
            tamano="sm"
            onClick={() => ejecutar("mensaje", { canal: tipoMensaje })}
            iconoIzq={<MessageCircle className="h-4 w-4" />}
          >
            Mensaje
          </Boton>
          <Boton
            variante={accion === "temperatura" ? "primario" : "secundario"}
            tamano="sm"
            onClick={() => ejecutar("temperatura")}
            iconoIzq={<Thermometer className="h-4 w-4" />}
          >
            Temperatura
          </Boton>
          <Boton
            variante={accion === "accion" ? "primario" : "secundario"}
            tamano="sm"
            onClick={() => ejecutar("accion")}
            iconoIzq={<Lightbulb className="h-4 w-4" />}
          >
            Próxima acción
          </Boton>
          <Boton
            variante={accion === "resumen" ? "primario" : "secundario"}
            tamano="sm"
            onClick={() => ejecutar("resumen")}
            iconoIzq={<FileText className="h-4 w-4" />}
          >
            Resumen
          </Boton>
          <Boton
            variante={accion === "objecion" ? "primario" : "secundario"}
            tamano="sm"
            onClick={() => ejecutar("objecion", { objecion: cliente.objecion })}
            iconoIzq={<Wand2 className="h-4 w-4" />}
          >
            Vencer objeción
          </Boton>
        </div>

        {accion === "mensaje" && (
          <div className="flex gap-2">
            <button
              onClick={() => setTipoMensaje("whatsapp")}
              className={`boton boton-secundario !min-h-[36px] !py-1.5 text-xs ${tipoMensaje === "whatsapp" ? "!bg-marca-100 dark:!bg-marca-500/20" : ""}`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setTipoMensaje("correo")}
              className={`boton boton-secundario !min-h-[36px] !py-1.5 text-xs ${tipoMensaje === "correo" ? "!bg-marca-100 dark:!bg-marca-500/20" : ""}`}
            >
              Correo
            </button>
          </div>
        )}

        <div className="min-h-[120px] rounded-xl border border-borde bg-superficie p-4">
          {cargando ? (
            <div className="flex items-center gap-2 text-sm text-texto-suave">
              <Sparkles className="h-4 w-4 animate-pulse text-marca-500" />
              Pensando…
            </div>
          ) : salida ? (
            <p className="whitespace-pre-wrap text-sm text-texto">{salida}</p>
          ) : (
            <p className="text-sm text-texto-suave">
              Elige una opción arriba. Yo armo el borrador, tú lo revisas y lo mandas.
            </p>
          )}
        </div>

        {salida && accion === "mensaje" && (
          <div className="flex flex-wrap gap-2">
            {tipoMensaje === "whatsapp" && cliente.telefono && (
              <Boton onClick={abrirWhats} iconoIzq={<MessageCircle className="h-4 w-4" />}>
                Abrir en WhatsApp
              </Boton>
            )}
            {tipoMensaje === "correo" && cliente.correo && (
              <Boton onClick={abrirCorreo} iconoIzq={<Mail className="h-4 w-4" />}>
                Abrir en correo
              </Boton>
            )}
            <Boton variante="secundario" onClick={copiar}>
              Copiar
            </Boton>
          </div>
        )}
      </div>
    </Modal>
  );
}

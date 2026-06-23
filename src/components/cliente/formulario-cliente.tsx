"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/boton";
import { InfoI } from "@/components/ui/info";
import { useToast } from "@/components/ui/toast";
import { Save, Building2, User, Thermometer, Target } from "lucide-react";

interface Inicial {
  id?: string;
  nombre?: string;
  telefono?: string;
  correo?: string;
  origen?: string;
  etapa?: string;
  temperatura?: string | null;
  objecion?: string;
  valorEstimado?: number;
  servicioInteres?: string;
  notas?: string;
  proximaAccion?: string;
  proximaAccionEn?: string | null;
  empresaNombre?: string;
  empresaGiro?: string;
  empresaPuesto?: string;
  empresaSitioWeb?: string;
  vendedorId?: string | null;
}

interface Props {
  inicial?: Inicial;
  vendedores: { id: string; nombre: string }[];
  usuarioActualId: string;
  alGuardar?: () => void;
}

const ORIGENES = [
  "Instagram",
  "Facebook",
  "Landing",
  "Recomendado",
  "WhatsApp",
  "Evento",
  "Otro",
];

export function FormularioCliente({ inicial = {}, vendedores, usuarioActualId, alGuardar }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [datos, setDatos] = useState<Inicial>({
    nombre: "",
    telefono: "",
    correo: "",
    origen: "",
    etapa: "NUEVO",
    temperatura: null,
    objecion: "",
    valorEstimado: 0,
    servicioInteres: "",
    notas: "",
    proximaAccion: "",
    proximaAccionEn: "",
    empresaNombre: "",
    empresaGiro: "",
    empresaPuesto: "",
    empresaSitioWeb: "",
    vendedorId: usuarioActualId,
    ...inicial,
  });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  function set<K extends keyof Inicial>(k: K, v: Inicial[K]) {
    setDatos((d) => ({ ...d, [k]: v }));
  }

  async function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setCargando(true);
    try {
      const url = inicial.id ? `/api/clientes/${inicial.id}` : "/api/clientes";
      const metodo = inicial.id ? "PATCH" : "POST";
      const r = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const j = await r.json();
      if (!j.ok) {
        if (j.errores) setErrores(j.errores);
        toast.error(j.mensaje || "No pudimos guardar");
        setCargando(false);
        return;
      }
      toast.exito(inicial.id ? "Cliente actualizado ✓" : "Cliente creado ✓");
      if (alGuardar) alGuardar();
      else router.push(`/clientes/${j.data.id}`);
      router.refresh();
    } catch {
      toast.error("Sin conexión. Reintenta.");
      setCargando(false);
    }
  }

  return (
    <form onSubmit={alEnviar} className="space-y-6">
      {/* Datos principales */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-texto-suave">
          <User className="h-4 w-4" /> Datos del cliente
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="etiqueta-campo">
              Nombre completo *
            </label>
            <input
              id="nombre"
              required
              value={datos.nombre ?? ""}
              onChange={(e) => set("nombre", e.target.value)}
              className="campo"
              placeholder="Juan Pérez"
            />
            {errores.nombre && <p className="error-campo">{errores.nombre}</p>}
          </div>
          <div>
            <label htmlFor="telefono" className="etiqueta-campo">
              WhatsApp{" "}
              <InfoI texto="Pon el número con lada (ej. 33 1234 5678). Sirve para los botones de WhatsApp y para que no se pierdan los mensajes." />
            </label>
            <input
              id="telefono"
              type="tel"
              value={datos.telefono ?? ""}
              onChange={(e) => set("telefono", e.target.value)}
              className="campo"
              placeholder="33 1234 5678"
            />
            <p className="ayuda-campo">Para mensajes pre-armados con un clic</p>
          </div>
          <div>
            <label htmlFor="correo" className="etiqueta-campo">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              value={datos.correo ?? ""}
              onChange={(e) => set("correo", e.target.value)}
              className="campo"
              placeholder="cliente@correo.com"
            />
          </div>
          <div>
            <label htmlFor="origen" className="etiqueta-campo">
              ¿De dónde llegó?
            </label>
            <select
              id="origen"
              value={datos.origen ?? ""}
              onChange={(e) => set("origen", e.target.value)}
              className="campo"
            >
              <option value="">— Elige uno —</option>
              {ORIGENES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="servicioInteres" className="etiqueta-campo">
              Servicio de interés
            </label>
            <input
              id="servicioInteres"
              value={datos.servicioInteres ?? ""}
              onChange={(e) => set("servicioInteres", e.target.value)}
              className="campo"
              placeholder="Mentoría 1-a-1, taller, conferencia…"
            />
          </div>
        </div>
      </div>

      {/* Venta */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-texto-suave">
          <Target className="h-4 w-4" /> Venta
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="etapa" className="etiqueta-campo">
              Etapa del embudo{" "}
              <InfoI texto="Mueve al cliente conforme avanza. Cada etapa indica qué tan cerca está de la venta." />
            </label>
            <select
              id="etapa"
              value={datos.etapa ?? "NUEVO"}
              onChange={(e) => set("etapa", e.target.value)}
              className="campo"
            >
              <option value="NUEVO">Nuevo</option>
              <option value="CONTACTADO">Contactado</option>
              <option value="CITA_AGENDADA">Cita agendada</option>
              <option value="PROPUESTA_ENVIADA">Propuesta enviada</option>
              <option value="SEGUIMIENTO">Seguimiento</option>
            </select>
          </div>
          <div>
            <label htmlFor="temperatura" className="etiqueta-campo">
              Temperatura{" "}
              <InfoI texto="Qué tan cerca está de comprar. 🔥 Caliente = atiéndelo hoy. 🔵 Frío = a futuro. Gasta tu energía primero en los calientes." />
            </label>
            <select
              id="temperatura"
              value={datos.temperatura ?? ""}
              onChange={(e) => set("temperatura", e.target.value || null)}
              className="campo"
            >
              <option value="">Sin clasificar</option>
              <option value="CALIENTE">🔥 Caliente</option>
              <option value="TIBIO">🟡 Tibio</option>
              <option value="FRIO">🔵 Frío</option>
            </select>
          </div>
          <div>
            <label htmlFor="valorEstimado" className="etiqueta-campo">
              Valor estimado (MXN){" "}
              <InfoI texto="Cuánto dinero representa este cliente si cierra. Sirve para saber a quién priorizar." />
            </label>
            <input
              id="valorEstimado"
              type="number"
              min={0}
              value={datos.valorEstimado ?? 0}
              onChange={(e) => set("valorEstimado", Number(e.target.value))}
              className="campo"
              placeholder="10000"
            />
          </div>
          <div>
            <label htmlFor="objecion" className="etiqueta-campo">
              <Thermometer className="inline h-3.5 w-3.5" /> Objeción principal{" "}
              <InfoI texto="La razón por la que NO te ha comprado. Anótala apenas la oigas: es lo que vas a vencer para cerrar." />
            </label>
            <input
              id="objecion"
              value={datos.objecion ?? ""}
              onChange={(e) => set("objecion", e.target.value)}
              className="campo"
              placeholder='Ej: "Está caro" o "Lo voy a pensar"'
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="proximaAccion" className="etiqueta-campo">
              Próxima acción{" "}
              <InfoI texto="El siguiente paso con este cliente. Si lo dejas vacío, el cliente se te enfría. Siempre déjale una." />
            </label>
            <input
              id="proximaAccion"
              value={datos.proximaAccion ?? ""}
              onChange={(e) => set("proximaAccion", e.target.value)}
              className="campo"
              placeholder="Ej: Mandar propuesta, confirmar cita, llamar para cerrar"
            />
          </div>
          <div>
            <label htmlFor="proximaAccionEn" className="etiqueta-campo">
              ¿Para cuándo?
            </label>
            <input
              id="proximaAccionEn"
              type="datetime-local"
              value={datos.proximaAccionEn ?? ""}
              onChange={(e) => set("proximaAccionEn", e.target.value)}
              className="campo"
            />
          </div>
          {vendedores.length > 1 && (
            <div>
              <label htmlFor="vendedorId" className="etiqueta-campo">
                Vendedor asignado
              </label>
              <select
                id="vendedorId"
                value={datos.vendedorId ?? ""}
                onChange={(e) => set("vendedorId", e.target.value)}
                className="campo"
              >
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Empresa (opcional) */}
      <details className="rounded-2xl border border-borde p-4">
        <summary className="cursor-pointer text-sm font-semibold text-texto">
          <Building2 className="inline h-4 w-4" /> Datos de empresa (opcional)
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta-campo" htmlFor="empresaNombre">
              Nombre de la empresa
            </label>
            <input
              id="empresaNombre"
              value={datos.empresaNombre ?? ""}
              onChange={(e) => set("empresaNombre", e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="etiqueta-campo" htmlFor="empresaGiro">
              Giro / industria
            </label>
            <input
              id="empresaGiro"
              value={datos.empresaGiro ?? ""}
              onChange={(e) => set("empresaGiro", e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="etiqueta-campo" htmlFor="empresaPuesto">
              Puesto/cargo del contacto
            </label>
            <input
              id="empresaPuesto"
              value={datos.empresaPuesto ?? ""}
              onChange={(e) => set("empresaPuesto", e.target.value)}
              className="campo"
            />
          </div>
          <div>
            <label className="etiqueta-campo" htmlFor="empresaSitioWeb">
              Sitio web / redes
            </label>
            <input
              id="empresaSitioWeb"
              value={datos.empresaSitioWeb ?? ""}
              onChange={(e) => set("empresaSitioWeb", e.target.value)}
              className="campo"
              placeholder="https://..."
            />
          </div>
        </div>
      </details>

      <div>
        <label htmlFor="notas" className="etiqueta-campo">
          Notas
        </label>
        <textarea
          id="notas"
          value={datos.notas ?? ""}
          onChange={(e) => set("notas", e.target.value)}
          className="campo min-h-[120px]"
          placeholder="Qué te platicó, qué le preocupa, qué necesita…"
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-borde pt-4">
        <Boton type="button" variante="secundario" onClick={() => router.back()}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={cargando} iconoIzq={<Save className="h-4 w-4" />}>
          {inicial.id ? "Guardar cambios" : "Crear cliente"}
        </Boton>
      </div>
    </form>
  );
}

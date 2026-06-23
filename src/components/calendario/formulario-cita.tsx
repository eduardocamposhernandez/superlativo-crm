"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/boton";
import { useToast } from "@/components/ui/toast";
import { Calendar } from "lucide-react";

interface Props {
  vendedorId: string;
  inicioPredeterminado?: string | null;
  clientePredeterminado?: string | null;
  clientes: { id: string; nombre: string }[];
}

function isoSinSegundos(s: string) {
  return s ? s.slice(0, 16) : "";
}

export function FormularioCita({ vendedorId, inicioPredeterminado, clientePredeterminado, clientes }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [clienteId, setClienteId] = useState(clientePredeterminado ?? "");
  const [inicio, setInicio] = useState(isoSinSegundos(inicioPredeterminado ?? new Date().toISOString()));
  const [duracion, setDuracion] = useState(30);
  const [titulo, setTitulo] = useState("Sesión Superlativo");
  const [notas, setNotas] = useState("");
  const [cargando, setCargando] = useState(false);
  const [avisoSinGoogle, setAvisoSinGoogle] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const r = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendedorId,
        clienteId: clienteId || null,
        inicio: new Date(inicio).toISOString(),
        duracionMin: duracion,
        titulo,
        notas,
      }),
    });
    const j = await r.json();
    setCargando(false);
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    if (j.data.sinGoogle) {
      setAvisoSinGoogle(true);
    } else {
      toast.exito("Cita agendada ✓");
    }
    router.push(clienteId ? `/clientes/${clienteId}` : "/agenda");
    router.refresh();
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <div>
        <label className="etiqueta-campo" htmlFor="cliente">Cliente (opcional)</label>
        <select id="cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="campo">
          <option value="">— Sin cliente específico —</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta-campo" htmlFor="inicio">Inicio</label>
          <input id="inicio" type="datetime-local" required value={inicio} onChange={(e) => setInicio(e.target.value)} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo" htmlFor="duracion">Duración (min)</label>
          <input id="duracion" type="number" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} className="campo" />
        </div>
      </div>
      <div>
        <label className="etiqueta-campo" htmlFor="titulo">Título</label>
        <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="campo" />
      </div>
      <div>
        <label className="etiqueta-campo" htmlFor="notas">Notas</label>
        <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} className="campo min-h-[80px]" />
      </div>
      {avisoSinGoogle && (
        <div className="rounded-xl border border-info/30 bg-info-suave p-3 text-xs text-info dark:bg-info/10">
          Cita guardada. Conecta Google Calendar para crear el evento y el Meet automático.
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={() => router.back()}>Cancelar</Boton>
        <Boton type="submit" cargando={cargando} iconoIzq={<Calendar className="h-4 w-4" />}>
          Agendar cita
        </Boton>
      </div>
    </form>
  );
}

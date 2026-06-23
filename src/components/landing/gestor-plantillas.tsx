"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Star, Copy, X } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";

interface Plantilla {
  id: string;
  nombre: string;
  canal: string;
  asunto: string;
  cuerpo: string;
  favorita: boolean;
  etapa: string;
  objecion: string;
  propia: boolean;
}

const VARIABLES_DEMO = {
  nombre: "Juan Pérez",
  empresa: "Acme S.A.",
  etapa: "Propuesta enviada",
  valor: "$15,000",
  vendedor: "Eduardo",
  objecion: "Está caro",
};

function rellenar(texto: string, vars: Record<string, string>) {
  return texto.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export function GestorPlantillas({ inicial }: { inicial: Plantilla[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [editar, setEditar] = useState<Partial<Plantilla> | null>(null);

  async function guardar() {
    if (!editar) return;
    const url = editar.id ? `/api/plantillas/${editar.id}` : "/api/plantillas";
    const metodo = editar.id ? "PATCH" : "POST";
    const r = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editar),
    });
    const j = await r.json();
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    setEditar(null);
    toast.exito("Plantilla guardada ✓");
    router.refresh();
  }

  async function borrar(id: string, nombre: string) {
    const ok = await confirmar({
      titulo: `¿Borrar "${nombre}"?`,
      mensaje: "Esta plantilla se borra para siempre.",
      peligro: true,
    });
    if (!ok) return;
    await fetch(`/api/plantillas/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function duplicar(p: Plantilla) {
    await fetch("/api/plantillas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, id: undefined, nombre: `${p.nombre} (copia)` }),
    });
    router.refresh();
  }

  async function copiarTexto(p: Plantilla) {
    const t = rellenar(p.cuerpo, VARIABLES_DEMO);
    await navigator.clipboard.writeText(t);
    toast.exito("Copiado al portapapeles ✓");
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-texto-suave">
          Variables: <code>{"{nombre} {empresa} {etapa} {valor} {vendedor} {objecion}"}</code>
        </p>
        <Boton onClick={() => setEditar({ canal: "whatsapp", cuerpo: "" })} iconoIzq={<Plus className="h-4 w-4" />}>
          Nueva plantilla
        </Boton>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {inicial.map((p) => (
          <li key={p.id} className="tarjeta p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-texto">
                  {p.favorita && <Star className="mr-1 inline h-3.5 w-3.5 fill-current text-yellow-500" />}
                  {p.nombre}
                </p>
                <p className="text-xs uppercase text-texto-tenue">
                  {p.canal} · {p.etapa || "todas las etapas"}
                </p>
              </div>
            </div>
            <p className="mt-2 line-clamp-3 text-xs text-texto-suave">{p.cuerpo}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button onClick={() => copiarTexto(p)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs">
                <Copy className="h-3 w-3" /> Copiar
              </button>
              <button onClick={() => duplicar(p)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs">
                Duplicar
              </button>
              {p.propia && (
                <>
                  <button onClick={() => setEditar(p)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs">
                    <Edit3 className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => borrar(p.id, p.nombre)} className="boton boton-fantasma !min-h-[32px] !py-1 text-xs text-peligro">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Modal
        abierto={!!editar}
        alCerrar={() => setEditar(null)}
        titulo={editar?.id ? "Editar plantilla" : "Nueva plantilla"}
        anchoMax="lg"
        pieDePagina={
          <>
            <Boton variante="secundario" onClick={() => setEditar(null)}>Cancelar</Boton>
            <Boton onClick={guardar} disabled={!editar?.nombre || !editar?.cuerpo}>Guardar</Boton>
          </>
        }
      >
        {editar && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="etiqueta-campo">Nombre</label>
                <input value={editar.nombre ?? ""} onChange={(e) => setEditar({ ...editar, nombre: e.target.value })} className="campo" />
              </div>
              <div>
                <label className="etiqueta-campo">Canal</label>
                <select value={editar.canal} onChange={(e) => setEditar({ ...editar, canal: e.target.value })} className="campo">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="correo">Correo</option>
                </select>
              </div>
            </div>
            {editar.canal === "correo" && (
              <div>
                <label className="etiqueta-campo">Asunto</label>
                <input value={editar.asunto ?? ""} onChange={(e) => setEditar({ ...editar, asunto: e.target.value })} className="campo" />
              </div>
            )}
            <div>
              <label className="etiqueta-campo">Cuerpo</label>
              <textarea
                value={editar.cuerpo ?? ""}
                onChange={(e) => setEditar({ ...editar, cuerpo: e.target.value })}
                className="campo min-h-[180px]"
                placeholder="Hola {nombre}, retomo nuestra conversación de {valor}..."
              />
            </div>
            <details className="rounded-xl border border-borde p-3">
              <summary className="cursor-pointer text-sm font-medium">Vista previa con datos reales</summary>
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-superficie p-3 text-sm">{rellenar(editar.cuerpo ?? "", VARIABLES_DEMO)}</p>
            </details>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editar.favorita ?? false}
                onChange={(e) => setEditar({ ...editar, favorita: e.target.checked })}
                className="accent-marca-500"
              />
              Marcar como favorita
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}

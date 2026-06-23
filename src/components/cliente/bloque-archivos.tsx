"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Upload, Trash2, Download } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";
import { fechaCorta } from "@/lib/formato";

interface Archivo {
  id: string;
  nombre: string;
  etiqueta: string;
  tipoMime: string;
  tamanoBytes: number;
  subidoEn: Date | string;
  subidoPor: { nombre: string } | null;
  contenidoBase: string | null;
  url: string | null;
}

const TIPOS_OK = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB en base. Para más grande, configurar Vercel Blob.

export function BloqueArchivos({
  clienteId,
  archivos,
}: {
  clienteId: string;
  archivos: Archivo[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();
  const refInput = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [etiqueta, setEtiqueta] = useState("Comprobante");

  async function subir(archivo: File) {
    if (!TIPOS_OK.includes(archivo.type)) {
      toast.error("Solo PDF o imágenes (JPG/PNG)");
      return;
    }
    if (archivo.size > MAX_BYTES) {
      toast.error("Máximo 4 MB. Para archivos grandes activa el almacenamiento opcional (ver guía).");
      return;
    }
    setSubiendo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base = String(reader.result).split(",")[1];
      const r = await fetch(`/api/clientes/${clienteId}/archivos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: archivo.name,
          tipoMime: archivo.type,
          tamanoBytes: archivo.size,
          etiqueta,
          contenidoBase: base,
        }),
      });
      const j = await r.json();
      setSubiendo(false);
      if (!j.ok) {
        toast.error(j.mensaje);
        return;
      }
      toast.exito("Archivo guardado ✓");
      router.refresh();
    };
    reader.readAsDataURL(archivo);
  }

  async function borrar(id: string, nombre: string) {
    const ok = await confirmar({
      titulo: `¿Borrar ${nombre}?`,
      mensaje: "Se enviará a la papelera.",
      peligro: true,
    });
    if (!ok) return;
    await fetch(`/api/clientes/${clienteId}/archivos?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div
      className="tarjeta p-5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) subir(f);
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-texto">
          <Paperclip className="h-4 w-4 text-marca-600" /> Archivos y documentos
        </h2>
        <div className="flex items-center gap-2">
          <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} className="campo !w-auto !min-h-[36px] !py-1 text-xs">
            <option>Comprobante</option>
            <option>Contrato</option>
            <option>Identificación</option>
            <option>Cotización</option>
            <option>Otro</option>
          </select>
          <input
            ref={refInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) subir(f);
            }}
          />
          <Boton tamano="sm" cargando={subiendo} onClick={() => refInput.current?.click()} iconoIzq={<Upload className="h-4 w-4" />}>
            Subir archivo
          </Boton>
        </div>
      </div>
      {archivos.length === 0 ? (
        <p className="text-sm text-texto-suave">
          Arrastra y suelta aquí, o usa el botón. PDFs, JPG o PNG (máx. 4 MB).
        </p>
      ) : (
        <ul className="space-y-2">
          {archivos.map((a) => {
            const href = a.url ?? `/api/clientes/${clienteId}/archivos/${a.id}`;
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-borde p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-texto">{a.nombre}</p>
                  <p className="text-xs text-texto-suave">
                    {a.etiqueta} · {fechaCorta(a.subidoEn)}
                    {a.subidoPor && ` · ${a.subidoPor.nombre}`}
                  </p>
                </div>
                <a
                  href={href}
                  download={a.nombre}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton boton-fantasma !min-h-[36px] !py-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar
                </a>
                <button
                  onClick={() => borrar(a.id, a.nombre)}
                  aria-label="Borrar archivo"
                  className="text-texto-tenue hover:text-peligro"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

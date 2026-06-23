"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Send, Trash2 } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { fechaRelativa } from "@/lib/formato";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";

interface Nota {
  id: string;
  contenido: string;
  creadaEn: Date | string;
  usuario: { nombre: string } | null;
}

export function BloqueNotas({ clienteId, notas }: { clienteId: string; notas: Nota[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    const r = await fetch(`/api/clientes/${clienteId}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: texto }),
    });
    const j = await r.json();
    setEnviando(false);
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    setTexto("");
    router.refresh();
  }

  async function borrar(id: string) {
    const ok = await confirmar({
      titulo: "¿Borrar esta nota?",
      mensaje: "Se enviará a la papelera.",
      peligro: true,
    });
    if (!ok) return;
    await fetch(`/api/clientes/${clienteId}/notas?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="tarjeta p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-texto">
        <FileText className="h-4 w-4 text-marca-600" /> Notas y conversaciones
      </h2>
      <div className="flex flex-col gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="campo min-h-[80px]"
          placeholder="¿Qué pasó en este contacto? ¿Qué objeción te dijeron? ¿Qué sigue?"
        />
        <Boton
          onClick={enviar}
          cargando={enviando}
          disabled={!texto.trim()}
          iconoIzq={<Send className="h-4 w-4" />}
          className="self-end"
        >
          Guardar nota
        </Boton>
      </div>
      <ul className="mt-4 space-y-3">
        {notas.map((n) => (
          <li key={n.id} className="rounded-xl border border-borde bg-superficie p-3">
            <p className="whitespace-pre-wrap text-sm text-texto">{n.contenido}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-texto-tenue">
              <span>
                {n.usuario?.nombre ?? "Sistema"} · {fechaRelativa(n.creadaEn)}
              </span>
              <button
                onClick={() => borrar(n.id)}
                aria-label="Borrar nota"
                className="text-texto-tenue hover:text-peligro"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {notas.length === 0 && (
          <li className="text-sm text-texto-suave">
            Aún no hay notas. Escribe la primera arriba.
          </li>
        )}
      </ul>
    </div>
  );
}

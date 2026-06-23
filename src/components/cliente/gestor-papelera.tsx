"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";
import { fechaCorta } from "@/lib/formato";

export function GestorPapelera({
  clientes,
}: {
  clientes: { id: string; nombre: string; eliminadoEn: Date }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();

  async function restaurar(id: string) {
    const r = await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _accion: "papelera-restaurar" }),
    });
    if (r.ok) {
      toast.exito("Restaurado");
      router.refresh();
    }
  }

  async function vaciar() {
    const ok = await confirmar({
      titulo: "¿Vaciar papelera?",
      mensaje: "Esto BORRA para siempre todo lo que está aquí. No se puede deshacer.",
      peligro: true,
      textoConfirmar: "Sí, borrar todo para siempre",
    });
    if (!ok) return;
    const r = await fetch("/api/papelera/vaciar", { method: "POST" });
    if (r.ok) {
      toast.exito("Papelera vacía");
      router.refresh();
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={vaciar} className="boton boton-peligro !min-h-[36px] !py-1.5 text-xs">
          <Trash2 className="h-3.5 w-3.5" /> Vaciar papelera
        </button>
      </div>
      <ul className="grid gap-2">
        {clientes.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-xl border border-borde bg-superficie-alta p-3">
            <div>
              <p className="text-sm font-medium text-texto">{c.nombre}</p>
              <p className="text-xs text-texto-suave">Borrado: {fechaCorta(c.eliminadoEn)}</p>
            </div>
            <button onClick={() => restaurar(c.id)} className="boton boton-suave !min-h-[36px] !py-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

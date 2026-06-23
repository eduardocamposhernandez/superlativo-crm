"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from "lucide-react";

type Tipo = "exito" | "error" | "info" | "aviso";

interface Toast {
  id: number;
  tipo: Tipo;
  mensaje: string;
  accion?: { etiqueta: string; alHacerClic: () => void };
  duracion?: number;
}

interface ContextoToast {
  mostrar: (t: Omit<Toast, "id">) => void;
  exito: (msg: string, accion?: Toast["accion"]) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  aviso: (msg: string) => void;
  deshacer: (msg: string, fn: () => void) => void;
}

const Ctx = createContext<ContextoToast | null>(null);

export function ProveedorToast({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const quitar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    const dur = t.duracion ?? (t.accion ? 6000 : 3500);
    window.setTimeout(() => quitar(id), dur);
  }, [quitar]);

  const api: ContextoToast = {
    mostrar,
    exito: (mensaje, accion) => mostrar({ tipo: "exito", mensaje, accion }),
    error: (mensaje) => mostrar({ tipo: "error", mensaje }),
    info: (mensaje) => mostrar({ tipo: "info", mensaje }),
    aviso: (mensaje) => mostrar({ tipo: "aviso", mensaje }),
    deshacer: (mensaje, fn) =>
      mostrar({
        tipo: "info",
        mensaje,
        accion: { etiqueta: "Deshacer", alHacerClic: fn },
        duracion: 6500,
      }),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} alCerrar={() => quitar(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastItem({ toast, alCerrar }: { toast: Toast; alCerrar: () => void }) {
  const colores: Record<Tipo, string> = {
    exito: "border-exito/20 bg-exito-suave dark:bg-exito/10 text-exito",
    error: "border-peligro/20 bg-peligro-suave dark:bg-peligro/10 text-peligro",
    info: "border-info/20 bg-info-suave dark:bg-info/10 text-info",
    aviso: "border-aviso/20 bg-aviso-suave dark:bg-aviso/10 text-aviso",
  };
  const Icono =
    toast.tipo === "exito"
      ? CheckCircle2
      : toast.tipo === "error" || toast.tipo === "aviso"
      ? AlertCircle
      : Info;

  return (
    <div
      role={toast.tipo === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-superficie-alta p-4 shadow-flotante animate-aparecer ${colores[toast.tipo]}`}
    >
      <Icono className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
      <p className="flex-1 text-sm text-texto">{toast.mensaje}</p>
      {toast.accion && (
        <button
          onClick={() => {
            toast.accion?.alHacerClic();
            alCerrar();
          }}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-marca-600 hover:bg-marca-50 dark:hover:bg-marca-500/10"
        >
          <Undo2 className="h-4 w-4" aria-hidden />
          {toast.accion.etiqueta}
        </button>
      )}
      <button
        onClick={alCerrar}
        aria-label="Cerrar aviso"
        className="rounded-lg p-1 text-texto-suave hover:bg-superficie hover:text-texto"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast debe usarse dentro de ProveedorToast");
  return c;
}

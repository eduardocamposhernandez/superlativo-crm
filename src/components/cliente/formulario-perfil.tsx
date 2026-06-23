"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/boton";
import { useToast } from "@/components/ui/toast";
import { Save, BookOpen } from "lucide-react";

interface Inicial {
  nombre: string;
  correo: string;
  slugAgenda: string;
}

export function FormularioPerfil({ inicial, onboardingCompletado }: { inicial: Inicial; onboardingCompletado: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [nombre, setNombre] = useState(inicial.nombre);
  const [correo, setCorreo] = useState(inicial.correo);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [cargando, setCargando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const r = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, contrasenaActual: actual || undefined, contrasenaNueva: nueva || undefined }),
    });
    const j = await r.json();
    setCargando(false);
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    toast.exito("Perfil guardado ✓");
    setNueva("");
    setActual("");
    router.refresh();
  }

  async function relanzarTour() {
    await fetch("/api/perfil/reset-onboarding", { method: "POST" });
    toast.info("Tutorial reiniciado. Recarga para verlo.");
    router.refresh();
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta-campo">Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Correo</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="campo" />
        </div>
      </div>
      <details className="rounded-xl border border-borde p-4">
        <summary className="cursor-pointer text-sm font-semibold">Cambiar contraseña</summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="etiqueta-campo">Contraseña actual</label>
            <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} className="campo" />
          </div>
          <div>
            <label className="etiqueta-campo">Contraseña nueva (mín. 8)</label>
            <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} className="campo" />
          </div>
        </div>
      </details>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={relanzarTour} className="text-xs text-marca-600 hover:underline">
          <BookOpen className="inline h-3.5 w-3.5" /> Ver el tutorial de nuevo
        </button>
        <p className="text-xs text-texto-tenue">Tu tutorial: {onboardingCompletado ? "completado ✓" : "pendiente"}</p>
      </div>
      <div className="flex justify-end">
        <Boton type="submit" cargando={cargando} iconoIzq={<Save className="h-4 w-4" />}>
          Guardar
        </Boton>
      </div>
    </form>
  );
}

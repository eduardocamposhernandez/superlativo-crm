"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function ErrorGeneral({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SUPERLATIVO] Error en la aplicación:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="tarjeta max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-peligro-suave text-peligro">
          <AlertCircle className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-texto">Algo se atoró</h1>
        <p className="mt-2 text-sm text-texto-suave">
          Tuvimos un problema. Inténtalo otra vez; si sigue pasando, revisa tu conexión.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={() => reset()} className="boton boton-primario">
            Reintentar
          </button>
          <Link href="/" className="boton boton-secundario">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

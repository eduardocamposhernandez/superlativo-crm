import Link from "next/link";
import { Compass } from "lucide-react";

export default function NoEncontrado() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="tarjeta max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-marca-50 text-marca-600 dark:bg-marca-500/10">
          <Compass className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-texto">No encontramos esa página</h1>
        <p className="mt-2 text-sm text-texto-suave">
          Puede que la liga esté escrita distinto o que la página haya cambiado de lugar.
        </p>
        <Link href="/" className="boton boton-primario mt-6 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

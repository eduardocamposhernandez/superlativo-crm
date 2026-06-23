import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { FormularioLogin } from "./formulario";

export default async function PaginaLogin() {
  const u = await obtenerUsuarioActual();
  if (u) redirect("/tablero");
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-marca-50 via-superficie to-superficie p-4 dark:from-marca-500/5 dark:via-superficie dark:to-superficie">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-marca-500 text-white shadow-marca">
            <span className="text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-texto">SUPERLATIVO</h1>
          <p className="mt-1 text-sm text-texto-suave">
            Tu CRM — entra para empezar a cerrar
          </p>
        </div>
        <div className="tarjeta p-6 sm:p-8">
          <FormularioLogin />
        </div>
      </div>
    </div>
  );
}

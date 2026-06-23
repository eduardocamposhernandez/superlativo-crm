import { Settings } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { SelectorTema } from "@/components/ui/selector-tema";
import { FormularioConfiguracion } from "@/components/cliente/formulario-config";

export default async function PaginaConfiguracion() {
  const u = await exigirSesion();
  const config = (await db.configuracion.findFirst()) ?? null;
  return (
    <>
      <EncabezadoSeccion
        Icono={Settings}
        titulo="Configuración"
        subtitulo="Tu negocio en un solo lugar"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 tarjeta p-6">
          {u.rol === "ADMIN" ? (
            <FormularioConfiguracion inicial={config} />
          ) : (
            <p className="text-sm text-texto-suave">Solo el admin puede editar la configuración del negocio.</p>
          )}
        </div>
        <div className="tarjeta p-6">
          <h3 className="mb-3 text-base font-semibold text-texto">Apariencia</h3>
          <SelectorTema />
        </div>
      </div>
    </>
  );
}

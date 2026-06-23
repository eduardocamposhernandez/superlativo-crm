import { User } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { SelectorTema } from "@/components/ui/selector-tema";
import { FormularioPerfil } from "@/components/cliente/formulario-perfil";

export default async function PaginaPerfil() {
  const u = await exigirSesion();
  const yo = await db.usuario.findUnique({ where: { id: u.id } });
  return (
    <>
      <EncabezadoSeccion
        Icono={User}
        titulo="Mi perfil"
        subtitulo="Datos personales y preferencias"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 tarjeta p-6">
          <FormularioPerfil
            inicial={{
              nombre: yo?.nombre ?? "",
              correo: yo?.correo ?? "",
              slugAgenda: yo?.slugAgenda ?? "",
            }}
            onboardingCompletado={yo?.onboardingCompletado ?? false}
          />
        </div>
        <div className="tarjeta p-6">
          <h3 className="mb-3 text-base font-semibold text-texto">Apariencia</h3>
          <p className="mb-3 text-xs text-texto-suave">Se guarda por usuario en todos tus dispositivos.</p>
          <SelectorTema />
        </div>
      </div>
    </>
  );
}

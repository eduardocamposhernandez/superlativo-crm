import { Sparkles } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { GestorPlantillas } from "@/components/landing/gestor-plantillas";

export default async function PaginaPlantillas() {
  const u = await exigirSesion();
  const plantillas = await db.plantilla.findMany({
    where: { OR: [{ usuarioId: u.id }, { usuarioId: null }] },
    orderBy: [{ favorita: "desc" }, { nombre: "asc" }],
  });
  return (
    <>
      <EncabezadoSeccion
        Icono={Sparkles}
        titulo="Mis plantillas"
        subtitulo="Mensajes que cierran, listos para mandar"
        ayuda="Crea plantillas con variables como {nombre}, {empresa}, {valor}. El sistema las rellena al mandarlas."
      />
      <GestorPlantillas inicial={plantillas.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        canal: p.canal,
        asunto: p.asunto ?? "",
        cuerpo: p.cuerpo,
        favorita: p.favorita,
        etapa: p.etapa ?? "",
        objecion: p.objecion ?? "",
        propia: p.usuarioId === u.id,
      }))} />
    </>
  );
}

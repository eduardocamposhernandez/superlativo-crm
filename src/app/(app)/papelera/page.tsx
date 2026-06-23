import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { GestorPapelera } from "@/components/cliente/gestor-papelera";

export default async function PaginaPapelera() {
  const u = await exigirSesion();
  if (u.rol !== "ADMIN") redirect("/tablero");
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clientes = await db.cliente.findMany({
    where: { eliminadoEn: { gte: hace30 } },
    orderBy: { eliminadoEn: "desc" },
    take: 200,
  });
  return (
    <>
      <EncabezadoSeccion
        Icono={Trash2}
        titulo="Papelera"
        subtitulo="Clientes borrados en los últimos 30 días"
        ayuda="Borrar NUNCA elimina al instante. Aquí puedes restaurar lo que se haya borrado."
      />
      {clientes.length === 0 ? (
        <EstadoVacio icono={Trash2} titulo="Papelera vacía" />
      ) : (
        <GestorPapelera clientes={clientes.map((c) => ({ id: c.id, nombre: c.nombre, eliminadoEn: c.eliminadoEn! }))} />
      )}
    </>
  );
}

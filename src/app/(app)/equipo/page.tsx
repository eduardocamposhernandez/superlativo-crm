import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { GestorEquipo } from "@/components/cliente/gestor-equipo";

export default async function PaginaEquipo() {
  const u = await exigirSesion();
  if (u.rol !== "ADMIN") redirect("/tablero");

  const usuarios = await db.usuario.findMany({
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    select: {
      id: true,
      nombre: true,
      correo: true,
      rol: true,
      activo: true,
      slugAgenda: true,
      metaMensual: true,
      metaClientesMensual: true,
      _count: { select: { clientes: true } },
    },
  });

  return (
    <>
      <EncabezadoSeccion
        Icono={UserCog}
        titulo="Equipo"
        subtitulo="Tu gente y sus metas"
        ayuda="Da de alta vendedores, asígnales meta y su liga de agenda. Solo tú (admin) puedes hacer esto."
        colorMatiz="text-cyan-600"
      />
      <GestorEquipo inicial={usuarios.map((x) => ({ ...x, clientesAsignados: x._count.clientes }))} />
    </>
  );
}

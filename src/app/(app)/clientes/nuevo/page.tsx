import { UserPlus } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { FormularioCliente } from "@/components/cliente/formulario-cliente";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";

interface Props {
  searchParams: Promise<{ nombre?: string }>;
}

export default async function PaginaNuevoCliente({ searchParams }: Props) {
  const u = await exigirSesion();
  const sp = await searchParams;
  const vendedores =
    u.rol === "ADMIN"
      ? await db.usuario.findMany({
          where: { activo: true, rol: { in: ["ADMIN", "VENDEDOR"] } },
          select: { id: true, nombre: true },
          orderBy: { nombre: "asc" },
        })
      : [];

  return (
    <>
      <EncabezadoSeccion
        Icono={UserPlus}
        titulo="Nuevo cliente"
        subtitulo="Captúralo en menos de 30 segundos: nombre y WhatsApp ya son suficientes"
        colorMatiz="text-sky-600"
      />
      <div className="tarjeta p-6">
        <FormularioCliente
          inicial={{ nombre: sp.nombre ?? "" }}
          vendedores={vendedores}
          usuarioActualId={u.id}
        />
      </div>
    </>
  );
}

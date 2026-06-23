import { CalendarPlus } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { FormularioCita } from "@/components/calendario/formulario-cita";
import { filtroPorRol } from "@/lib/permisos";

interface Props {
  searchParams: Promise<{ inicio?: string; clienteId?: string }>;
}

export default async function PaginaNuevaCita({ searchParams }: Props) {
  const u = await exigirSesion();
  const sp = await searchParams;
  const clientes = await db.cliente.findMany({
    where: { eliminadoEn: null, estadoCartera: "ACTIVO", ...filtroPorRol(u) },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
    take: 500,
  });
  return (
    <>
      <EncabezadoSeccion
        Icono={CalendarPlus}
        titulo="Nueva cita"
        subtitulo="Agéndala y, si Google está conectado, se genera Meet automático"
        colorMatiz="text-green-600"
      />
      <div className="tarjeta p-6">
        <FormularioCita
          vendedorId={u.id}
          inicioPredeterminado={sp.inicio ?? null}
          clientePredeterminado={sp.clienteId ?? null}
          clientes={clientes}
        />
      </div>
    </>
  );
}

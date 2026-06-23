import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { exigirSesion } from "@/lib/auth";
import { puede } from "@/lib/permisos";
import { db } from "@/lib/db";
import { ExpedienteCliente } from "@/components/cliente/expediente";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaginaExpediente({ params }: Props) {
  const u = await exigirSesion();
  const { id } = await params;
  const c = await db.cliente.findUnique({
    where: { id },
    include: {
      vendedor: { select: { id: true, nombre: true } },
      etiquetas: { include: { etiqueta: true } },
      citas: {
        where: { eliminadoEn: null },
        orderBy: { inicio: "desc" },
        take: 20,
        include: { vendedor: { select: { nombre: true } } },
      },
      pagos: { where: { eliminadoEn: null }, orderBy: { creadoEn: "desc" } },
      notasLista: {
        where: { eliminadoEn: null },
        orderBy: { creadaEn: "desc" },
        include: { usuario: { select: { nombre: true } } },
      },
      archivos: {
        where: { eliminadoEn: null },
        orderBy: { subidoEn: "desc" },
        include: { subidoPor: { select: { nombre: true } } },
      },
      eventos: { orderBy: { ocurridoEn: "desc" }, take: 100 },
    },
  });
  if (!c) notFound();
  if (!puede(u, "ver", c)) notFound();

  const vendedores =
    u.rol === "ADMIN"
      ? await db.usuario.findMany({
          where: { activo: true, rol: { in: ["ADMIN", "VENDEDOR"] } },
          select: { id: true, nombre: true },
          orderBy: { nombre: "asc" },
        })
      : [];
  const config = await db.configuracion.findFirst();

  return (
    <>
      <Link
        href="/clientes"
        className="mb-3 inline-flex items-center gap-1 text-sm text-texto-suave hover:text-marca-600"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a clientes
      </Link>
      <ExpedienteCliente
        cliente={c}
        vendedores={vendedores}
        usuarioActualId={u.id}
        usuarioRol={u.rol}
        mensajeWhatsAppPlantilla={config?.mensajeWhatsApp ?? ""}
        motivosPerdida={(config?.motivosPerdida ?? "Precio,Lo voy a pensar,No es buen momento,Otro").split(",")}
      />
    </>
  );
}

import Link from "next/link";
import { Wallet, Download } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { Badge } from "@/components/ui/badge";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { dinero, fechaCorta } from "@/lib/formato";

export default async function PaginaPagos() {
  const u = await exigirSesion();
  const filtroDueno = filtroPorRol(u);
  const pagos = await db.pago.findMany({
    where: { eliminadoEn: null, cliente: filtroDueno },
    include: { cliente: { select: { id: true, nombre: true } } },
    orderBy: { creadoEn: "desc" },
    take: 200,
  });

  const ahora = new Date();
  const mes = ahora.getMonth(), anio = ahora.getFullYear();
  const cobrado = pagos
    .filter((p) => p.estado === "PAGADO" && p.fechaPago && p.fechaPago.getMonth() === mes && p.fechaPago.getFullYear() === anio)
    .reduce((s, p) => s + p.monto, 0);
  const vencidos = pagos.filter((p) => p.estado === "VENCIDO" || (p.estado === "PENDIENTE" && p.fechaVencimiento && p.fechaVencimiento < ahora));
  const pendientes = pagos.filter((p) => p.estado === "PENDIENTE");

  return (
    <>
      <EncabezadoSeccion
        Icono={Wallet}
        titulo="Pagos"
        subtitulo="Lo que cobraste y lo que falta"
        ayuda="Los pagos vencidos son la venta más fácil: ya te dijeron que sí. Cóbralos hoy."
        colorMatiz="text-emerald-600"
        accion={
          <Link href="/api/exportar?tipo=pagos" className="boton boton-secundario">
            <Download className="h-4 w-4" /> Exportar CSV
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card titulo="Cobrado este mes" valor={dinero(cobrado)} tono="exito" />
        <Card titulo="Pendientes" valor={dinero(pendientes.reduce((s, p) => s + p.monto, 0))} tono="aviso" />
        <Card titulo="Vencidos" valor={dinero(vencidos.reduce((s, p) => s + p.monto, 0))} tono="peligro" />
      </div>

      {pagos.length === 0 ? (
        <EstadoVacio icono={Wallet} titulo="Sin pagos registrados aún" descripcion="Cuando registres un pago en la ficha de un cliente, aparecerá aquí." />
      ) : (
        <div className="tarjeta overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-borde bg-superficie/50 text-left text-xs uppercase text-texto-suave">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-b border-borde">
                  <td className="px-4 py-3">
                    {p.cliente ? (
                      <Link href={`/clientes/${p.cliente.id}`} className="enlace-nombre">
                        {p.cliente.nombre}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-texto-suave">{p.metodo}</td>
                  <td className="px-4 py-3 text-texto-suave">{p.fechaPago ? fechaCorta(p.fechaPago) : (p.fechaVencimiento ? `Vence ${fechaCorta(p.fechaVencimiento)}` : "—")}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{dinero(p.monto)}</td>
                  <td className="px-4 py-3">
                    <Badge tono={p.estado === "PAGADO" ? "exito" : p.estado === "VENCIDO" ? "peligro" : "aviso"}>{p.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Card({ titulo, valor, tono }: { titulo: string; valor: string; tono: "exito" | "aviso" | "peligro" }) {
  const c = tono === "exito" ? "text-marca-600" : tono === "aviso" ? "text-aviso" : "text-peligro";
  return (
    <div className="tarjeta p-5">
      <p className="text-sm text-texto-suave">{titulo}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${c}`}>{valor}</p>
    </div>
  );
}

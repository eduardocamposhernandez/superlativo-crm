import { Share2, Link as LinkIco } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { exigirSesion } from "@/lib/auth";
import { PanelComparte } from "@/components/landing/panel-comparte";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function PaginaComparte() {
  const u = await exigirSesion();
  const h = await headers();
  const host = h.get("host") ?? "tu-crm.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`;
  const vendedor = await db.usuario.findUnique({ where: { id: u.id } });
  const ligaPropia = vendedor?.slugAgenda ? `${base}/agenda/${vendedor.slugAgenda}` : null;

  return (
    <>
      <EncabezadoSeccion
        Icono={Share2}
        titulo="Comparte y crece"
        subtitulo="Difunde tu landing y mide qué canal vende"
        ayuda="Cada liga aquí lleva un canal marcado. Cuando alguien llega por ella, el CRM guarda de dónde vino. Así sabes qué red social te vende."
        colorMatiz="text-marca-600"
      />
      <PanelComparte ligaLanding={base} ligaPropia={ligaPropia} />
    </>
  );
}

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FormularioLanding } from "@/components/landing/formulario-landing";
import { iniciales } from "@/lib/formato";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ utm_source?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const v = await db.usuario.findUnique({ where: { slugAgenda: slug } });
  if (!v) return { title: "Agenda" };
  return {
    title: `Agenda una cita con ${v.nombre} · SUPERLATIVO`,
    description: `Reserva tu cita 1-a-1 con ${v.nombre} en Superlativo.`,
    openGraph: {
      title: `Agenda con ${v.nombre} · SUPERLATIVO`,
      description: "Mentoría y procesos de claridad personal.",
      type: "profile",
    },
  };
}

export default async function PaginaAgendaVendedor({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const v = await db.usuario.findUnique({ where: { slugAgenda: slug } });
  if (!v || !v.activo) notFound();
  const config = await db.configuracion.findFirst();

  return (
    <main className="min-h-screen bg-gradient-to-br from-superficie via-marca-50/30 to-superficie p-4 dark:from-superficie dark:via-marca-500/5 dark:to-superficie">
      <div className="mx-auto max-w-md py-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-marca-500 text-2xl font-bold text-white shadow-marca">
            {iniciales(v.nombre)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-texto">Agenda una llamada conmigo</h1>
            <p className="text-sm text-texto-suave">{v.nombre} · SUPERLATIVO</p>
          </div>
        </div>
        <div className="tarjeta p-6 shadow-flotante">
          <FormularioLanding
            canal={sp.utm_source ?? `Agenda ${v.nombre}`}
            vendedorSlug={slug}
            horarioInicio={config?.horarioInicio ?? "09:00"}
            horarioFin={config?.horarioFin ?? "18:00"}
            duracionMin={config?.duracionCitaMin ?? 30}
          />
        </div>
        <p className="mt-6 text-center text-xs text-texto-tenue">
          Sesiones 1-a-1. Sin compromiso inicial.
        </p>
      </div>
    </main>
  );
}

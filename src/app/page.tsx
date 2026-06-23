import Link from "next/link";
import { CheckCircle2, Compass, Sparkles, Quote, Users, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { FormularioLanding } from "@/components/landing/formulario-landing";

export const metadata = {
  title: "SUPERLATIVO — Mentoría para tomar mejores decisiones",
  description:
    "Acompañamiento para entender quién eres, tu historia, tu valor y tu siguiente decisión importante. Mentoría, conferencias y procesos de claridad personal en León, Guanajuato.",
  openGraph: {
    title: "SUPERLATIVO — Mentoría y claridad personal",
    description:
      "Procesos de mentoría, conferencias y proyectos para jóvenes, adultos e instituciones que necesitan tomar mejores decisiones de vida, carrera y reinvención.",
    type: "website",
    locale: "es_MX",
    siteName: "SUPERLATIVO",
  },
};

export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string; utm_medium?: string }>;
}) {
  const sp = await searchParams;
  const config = await db.configuracion.findFirst();
  return (
    <main className="min-h-screen bg-gradient-to-br from-superficie via-marca-50/50 to-superficie text-texto dark:from-superficie dark:via-marca-500/5 dark:to-superficie">
      {/* Encabezado */}
      <header className="border-b border-borde bg-superficie-alta/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-marca-500 text-white shadow-marca">
              <span className="font-bold">S</span>
            </div>
            <span className="font-bold text-texto">SUPERLATIVO</span>
          </div>
          <Link href="/login" className="text-sm font-medium text-texto-suave hover:text-marca-600">
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-marca-200 bg-marca-50 px-3 py-1 text-xs font-medium text-marca-700 dark:border-marca-500/20 dark:bg-marca-500/10 dark:text-marca-300">
              <Sparkles className="h-3 w-3" /> León, Guanajuato · Mentoría 1-a-1
            </p>
            <h1 className="text-3xl font-bold leading-tight text-texto sm:text-5xl">
              Encuentra <span className="text-marca-600">claridad</span> y toma tu siguiente decisión importante
            </h1>
            <p className="mt-4 text-lg text-texto-suave">
              Acompañamiento para que entiendas quién eres, tu historia, tu valor y los caminos
              reales que puedes tomar. Mentoría, conferencias y procesos de claridad personal de
              alto rendimiento.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#agenda" className="boton boton-primario !min-h-[56px] !text-base">
                Agenda tu cita
              </a>
              <a
                href="https://wa.me/5214772177331?text=Hola%20Eduardo%2C%20quiero%20saber%20m%C3%A1s%20de%20Superlativo"
                target="_blank"
                rel="noopener noreferrer"
                className="boton boton-secundario !min-h-[56px] !text-base"
              >
                <MessageCircle className="h-4 w-4" /> Escríbenos por WhatsApp
              </a>
            </div>

            {/* Prueba de confianza */}
            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              <Stat n="+500" label="personas atendidas" />
              <Stat n="12 años" label="acompañando procesos" />
              <Stat n="98%" label="recomienda Superlativo" />
            </div>
          </div>

          {/* Form */}
          <div id="agenda" className="tarjeta p-6 sm:p-8 shadow-flotante">
            <h2 className="text-xl font-bold text-texto">Agenda tu cita exploratoria</h2>
            <p className="mt-1 text-sm text-texto-suave">
              Te contactamos en menos de 24 horas. Sin compromiso.
            </p>
            <div className="mt-5">
              <FormularioLanding
                canal={sp.utm_source ?? "Landing"}
                horarioInicio={config?.horarioInicio ?? "09:00"}
                horarioFin={config?.horarioFin ?? "18:00"}
                duracionMin={config?.duracionCitaMin ?? 30}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lo que vas a vivir */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-texto sm:text-3xl">Lo que vas a vivir</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { Icono: Compass, titulo: "Claridad", texto: "Entiendes quién eres y por qué tomas las decisiones que tomas." },
            { Icono: Users, titulo: "Acompañamiento", texto: "Un mentor que te escucha, te reta y te sostiene." },
            { Icono: CheckCircle2, titulo: "Decisiones reales", texto: "Sales con un siguiente paso concreto, no con una motivación vacía." },
          ].map(({ Icono, titulo, texto }) => (
            <div key={titulo} className="tarjeta p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-marca-500/10">
                <Icono className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-texto">{titulo}</h3>
              <p className="mt-1 text-sm text-texto-suave">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-texto sm:text-3xl">Lo que dicen quienes vivieron el proceso</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { t: '"Me devolvió la brújula. Llevaba años postergando una decisión, salí con un plan concreto."', a: "— Mariana R., 38 años" },
            { t: '"Para mí lo más valioso fue verme con honestidad. Eduardo te acompaña, no te endulza."', a: "— Carlos H., dueño de empresa" },
          ].map(({ t, a }) => (
            <div key={a} className="tarjeta p-6">
              <Quote className="h-6 w-6 text-marca-500" />
              <p className="mt-3 text-base italic text-texto">{t}</p>
              <p className="mt-2 text-sm text-texto-suave">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-borde bg-superficie-alta/60 py-8 backdrop-blur">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-texto-suave sm:px-6">
          © {new Date().getFullYear()} SUPERLATIVO · León, Guanajuato · Hecho con amor a la claridad
        </p>
      </footer>
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-marca-600 sm:text-3xl">{n}</p>
      <p className="text-xs text-texto-suave">{label}</p>
    </div>
  );
}

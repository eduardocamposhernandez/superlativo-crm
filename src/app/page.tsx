import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Mail,
  ChevronRight,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { db } from "@/lib/db";
import { FormularioLanding } from "@/components/landing/formulario-landing";

export const metadata = {
  title: "Superlativo · Claridad para decidir el siguiente paso de tu vida",
  description:
    "Ecosistema de mentoría, conferencias y procesos de claridad personal para jóvenes, adultos e instituciones. Dr. Eduardo Campos · León, Guanajuato.",
  openGraph: {
    title: "Superlativo — Claridad para decidir el siguiente paso de tu vida",
    description:
      "Procesos de mentoría, reinvención adulta, conferencias y consultoría institucional. Una conversación inicial gratuita de 30 minutos.",
    type: "website",
    locale: "es_MX",
    siteName: "Superlativo",
  },
  twitter: { card: "summary_large_image" },
};

const WHATSAPP = "5214772177331";
const MENSAJE_WA =
  "Hola Eduardo, vi superlativo.net y me gustaría agendar una conversación inicial.";

export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string }>;
}) {
  const sp = await searchParams;
  const config = await db.configuracion.findFirst();

  return (
    <main className="min-h-screen bg-noche-900 text-white antialiased">
      <BarraSuperior />
      <Hero
        canal={sp.utm_source}
        horarioInicio={config?.horarioInicio ?? "09:00"}
        horarioFin={config?.horarioFin ?? "18:00"}
        duracionMin={config?.duracionCitaMin ?? 30}
      />
      <EnfoqueSuperlativo />
      <Ecosistema />
      <RutaSuperlativa />
      <Fenix />
      <FaroNexus />
      <SobreEduardo />
      <Testimonios />
      <Proceso />
      <CTAFinal />
      <Footer />
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function BarraSuperior() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-noche-900/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image src="/logos/logo.png" alt="Superlativo" width={40} height={40} className="h-full w-full object-contain p-1" />
          </div>
          <span className="font-serif text-xl font-bold tracking-wide">
            <span className="text-lima-400">S</span>uperlativo
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-white/80 lg:flex">
          <a href="#ecosistema" className="hover:text-lima-400">Ecosistema</a>
          <a href="#ruta" className="hover:text-lima-400">Ruta Superlativa</a>
          <a href="#fenix" className="hover:text-lima-400">Fénix</a>
          <a href="#sobre" className="hover:text-lima-400">Sobre Eduardo</a>
          <a href="#contacto" className="hover:text-lima-400">Contacto</a>
        </nav>
        <a
          href="#agenda"
          className="hidden rounded-xl border border-lima-500/40 bg-lima-500/10 px-4 py-2 text-sm font-medium text-lima-300 hover:bg-lima-500/20 sm:inline-flex"
        >
          Agendar conversación
        </a>
        <Link
          href="/login"
          className="text-xs text-white/40 hover:text-white/60 lg:ml-4"
          aria-label="Entrar al CRM"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Hero({
  canal,
  horarioInicio,
  horarioFin,
  duracionMin,
}: {
  canal?: string;
  horarioInicio: string;
  horarioFin: string;
  duracionMin: number;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(164,196,26,0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(63,191,143,0.06) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-lima-500/30 bg-lima-500/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-lima-300">
            <span className="h-1.5 w-1.5 rounded-full bg-lima-400" />
            Mentoría y claridad personal · León, GTO
          </p>
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="titulo-plata">Claridad para decidir el</span>{" "}
            <em className="font-serif italic titulo-lima not-italic-sm">siguiente paso</em>{" "}
            <span className="titulo-plata">de tu vida.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Superlativo es un ecosistema de acompañamiento personal, vocacional y profesional para
            jóvenes, adultos e instituciones que necesitan convertir su historia en dirección.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#agenda" className="boton-lima">
              Agendar conversación diagnóstica
            </a>
            <a href="#ecosistema" className="boton-fantasma-claro">
              Conocer las rutas
              <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
            <Stat n="+30" label="años acompañando procesos" />
            <Stat n="4" label="pilares del ecosistema" />
            <Stat n="30 min" label="conversación inicial gratis" />
          </div>
        </div>

        {/* Formulario en el hero */}
        <div id="agenda" className="lg:pl-6">
          <div className="tarjeta-landing p-6 sm:p-8 shadow-2xl">
            <h2 className="font-serif text-2xl text-white">Empecemos con una conversación</h2>
            <p className="mt-2 text-sm text-white/60">
              30 minutos, sin costo ni compromiso. Solo para conocernos y ver si el proceso tiene
              sentido para ti.
            </p>
            <div className="mt-5">
              <FormularioLanding
                canal={canal ?? "Landing"}
                horarioInicio={horarioInicio}
                horarioFin={horarioFin}
                duracionMin={duracionMin}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl text-lima-400 sm:text-3xl">{n}</p>
      <p className="mt-1 text-xs text-white/50">{label}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function EnfoqueSuperlativo() {
  return (
    <section className="border-y border-white/5 bg-noche-800/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-3xl text-white sm:text-4xl">
          <span className="titulo-plata">El enfoque Superlativo</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/70">
          Creemos que las respuestas que buscas no están en tests estandarizados ni en fórmulas
          genéricas. Están en tu propia trayectoria, en tus talentos naturales y en las experiencias
          que te han formado.
        </p>
        <p className="mt-8 font-serif text-2xl italic text-lima-300 sm:text-3xl">
          &ldquo;Tu historia no es un obstáculo: es un mapa.&rdquo;
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Ecosistema() {
  const pilares = [
    {
      id: "ruta",
      titulo: "Ruta Superlativa",
      lema: "Para jóvenes decidiendo su futuro",
      texto:
        "Acompañamiento profundo para jóvenes que buscan definir su camino profesional. Transformamos la confusión y la presión en una decisión vocacional fundamentada en el autoconocimiento real.",
      logo: "/logos/rutasuperlativa.png",
      acento: "text-lima-400",
      tagline: "Claridad es plenitud",
    },
    {
      id: "fenix",
      titulo: "Superlativo Fénix",
      lema: "Reinvención para la adultez",
      texto:
        "Mentoría estratégica para adultos en transición. Un proceso para quienes necesitan reinventarse, recuperar el control de sus decisiones y trazar una segunda o tercera etapa de vida con propósito.",
      logo: "/logos/superlativofenix.png",
      acento: "text-amber-400",
      tagline: "Es tiempo de reinventarse",
    },
    {
      id: "faro",
      titulo: "Superlativo FARO",
      lema: "Conferencias y divulgación",
      texto:
        "El brazo de perspectiva del ecosistema. Conferencias magistrales, paneles y contenidos para instituciones educativas, foros y comunidades que requieren elevar la conversación sobre el futuro, las decisiones vitales y el liderazgo.",
      logo: "/logos/superlativofaro.png",
      acento: "text-sky-300",
      tagline: "Capacidades que transforman vidas",
    },
    {
      id: "nexus",
      titulo: "Superlativo Nexus",
      lema: "Para instituciones y organizaciones",
      texto:
        "Capa corporativa e institucional. Procesos de consultoría y formación para equipos de trabajo, ayudando a alinear el talento individual con los objetivos macro de la organización. Aportamos cohesión, claridad estratégica y herramientas de liderazgo.",
      logo: "/logos/superlativonexus.png",
      acento: "text-orange-300",
      tagline: "Colaboración que se vuelve fuerza",
    },
  ];

  return (
    <section id="ecosistema" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl text-white sm:text-5xl">
            <span className="titulo-plata">Ecosistema Superlativo</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Cuatro capas diseñadas para atender necesidades específicas de claridad y desarrollo en
            diferentes etapas de la vida y la organización.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {pilares.map(({ id, titulo, lema, texto, logo, acento, tagline }) => (
            <a
              key={id}
              href={`#${id}`}
              className="tarjeta-landing group p-7 transition-all hover:border-lima-500/30 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg">
                  <Image
                    src={logo}
                    alt={titulo}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-white">{titulo}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{lema}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/70">{texto}</p>
              <p className={`mt-4 text-xs italic ${acento} opacity-80`}>{tagline}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function RutaSuperlativa() {
  const etapas = [
    {
      n: "01",
      titulo: "Brújula Interna",
      etiqueta: "Autoconocimiento",
      texto:
        "Descubrimos quién eres realmente: tus fortalezas, tus valores, lo que te apasiona. No lo que crees que deberías ser, sino lo que genuinamente eres. Aquí identificamos tus talentos naturales, tus intereses auténticos y lo que te hace sentir vivo.",
    },
    {
      n: "02",
      titulo: "Exploración Consciente",
      etiqueta: "Descubrimiento",
      texto:
        "Exploramos opciones de carrera, profesiones y caminos que se alinean con quien eres. No es una lista genérica: es una exploración personalizada basada en tus características únicas. Investigamos, cuestionamos y validamos qué opciones realmente te llaman.",
    },
    {
      n: "03",
      titulo: "Decisión Consciente",
      etiqueta: "Claridad",
      texto:
        "Llegamos al momento de decidir desde la claridad, no desde el miedo o la presión. Construimos tu plan de acción: qué pasos tomar, cómo prepararte, cómo comunicar tu decisión. Aquí ganas confianza en tu elección porque la has explorado profundamente.",
    },
    {
      n: "04",
      titulo: "Rumbo Seguro",
      etiqueta: "Acción",
      texto:
        "Implementamos tu decisión con seguridad. Preparamos tu transición, resolvemos dudas de último momento, construimos tu confianza para el siguiente capítulo. No te dejamos en la puerta: te acompañamos en los primeros pasos de tu nuevo camino.",
    },
  ];

  return (
    <section id="ruta" className="border-t border-white/5 bg-noche-800/30 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-lima-400">
            Para jóvenes decidiendo su futuro
          </p>
          <h2 className="font-serif text-3xl text-white sm:text-5xl">
            <span className="titulo-plata">Ruta</span>{" "}
            <em className="font-serif italic titulo-lima">Superlativa</em>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/70">
            Un programa diseñado para disipar la ansiedad de la elección de carrera mediante un
            mapeo profundo de fortalezas, intereses genuinos y posibilidades reales del entorno.
          </p>
          <p className="mt-4 text-sm text-white/50">
            4 sesiones por etapa · 2 a 4 semanas según tu ritmo · presencial o videoconferencia
          </p>
        </div>

        <ol className="space-y-4">
          {etapas.map(({ n, titulo, etiqueta, texto }) => (
            <li key={n} className="tarjeta-landing flex gap-5 p-6 sm:p-7">
              <span className="font-serif text-4xl text-white/15 sm:text-5xl">{n}</span>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-xl text-lima-300 sm:text-2xl">{titulo}</h3>
                  <span className="inline-flex items-center rounded-full border border-lima-500/30 bg-lima-500/10 px-2.5 py-0.5 text-xs text-lima-300">
                    {etiqueta}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/70">{texto}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* "Esto NO es / Esto SÍ es" */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="tarjeta-landing p-6">
            <h3 className="mb-3 font-serif text-lg text-white/60">Esto NO es…</h3>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                "Un test vocacional con lista de carreras.",
                "Una terapia psicológica.",
                "Un curso masivo o genérico.",
                "Presión para elegir lo \"correcto\".",
                "Orientación basada solo en el mercado.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-white/30">✕</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tarjeta-landing border-lima-500/20 bg-lima-500/[0.04] p-6">
            <h3 className="mb-3 font-serif text-lg text-lima-300">Esto SÍ es…</h3>
            <ul className="space-y-2 text-sm text-white/80">
              {[
                "Un proceso personalizado que parte de quién eres.",
                "Acompañamiento humano, profundo y sin juicios.",
                "Claridad con aplicación práctica y pasos concretos.",
                "Respeto por tu historia, ritmo y posibilidades.",
                "Un espacio serio, humano y transformador.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-lima-400">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Fenix() {
  const fases = [
    {
      n: "01",
      titulo: "Temple",
      texto:
        "Auditoría vital y reconocimiento de la realidad actual. Despejamos el ruido para ver el mapa con claridad.",
    },
    {
      n: "02",
      titulo: "Rumbo",
      texto:
        "Definición de las nuevas coordenadas. Qué se queda, qué se suelta y hacia dónde apuntamos el timón.",
    },
    {
      n: "03",
      titulo: "Cumbre",
      texto:
        "Estrategia de ejecución. Acciones precisas, sostenibles y medibles para materializar la reinvención.",
    },
  ];

  return (
    <section id="fenix" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-300">
            Reinvención para la adultez
          </p>
          <h2 className="font-serif text-3xl text-white sm:text-5xl">
            <span className="titulo-plata">Superlativo</span>{" "}
            <em className="font-serif italic text-amber-300">Fénix</em>
          </h2>
          <p className="mt-6 leading-relaxed text-white/70">
            Llega un punto donde la experiencia acumulada exige un nuevo formato. Fénix es el
            espacio confidencial y estratégico para cuestionar lo construido, rescatar lo esencial
            y diseñar una etapa donde el propósito y la rentabilidad convergen.
          </p>
          <p className="mt-4 text-sm italic text-amber-300/80">
            No es coaching de motivación. No es terapia. Es un acompañamiento que parte de todo lo
            que ya viviste — tus logros, tus fracasos, tus sueños truncos — para construir desde
            ahí una nueva etapa que por fin sea tuya.
          </p>
        </div>
        <ol className="space-y-3">
          {fases.map(({ n, titulo, texto }) => (
            <li key={n} className="tarjeta-landing flex gap-5 p-6">
              <span className="font-serif text-3xl text-white/20">{n}</span>
              <div>
                <h3 className="font-serif text-xl text-amber-300">{titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function FaroNexus() {
  return (
    <section className="border-y border-white/5 bg-noche-800/30 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
        <div id="faro" className="tarjeta-landing p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sky-300">
            Conferencias e instituciones educativas
          </p>
          <h3 className="font-serif text-3xl text-white">Superlativo FARO</h3>
          <p className="mt-5 leading-relaxed text-white/70">
            El brazo de perspectiva del ecosistema. Diseñado para instituciones educativas, foros y
            comunidades que requieren elevar la conversación sobre el futuro, las decisiones
            vitales y el liderazgo. Proveemos conferencias magistrales, paneles y contenidos que
            desafían el statu quo y ofrecen marcos de referencia prácticos.
          </p>
          <p className="mt-5 text-sm italic text-sky-300/80">
            &ldquo;Capacidades que transforman vidas.&rdquo;
          </p>
        </div>
        <div id="nexus" className="tarjeta-landing p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-orange-300">
            Capa corporativa e institucional
          </p>
          <h3 className="font-serif text-3xl text-white">Superlativo Nexus</h3>
          <p className="mt-5 leading-relaxed text-white/70">
            Facilitamos procesos de consultoría y formación para equipos de trabajo, ayudando a
            alinear el talento individual con los objetivos macro de la organización. Aportamos
            cohesión, claridad estratégica y herramientas de liderazgo para entornos de alta
            exigencia.
          </p>
          <p className="mt-5 text-sm italic text-orange-300/80">
            &ldquo;Colaboración que se vuelve fuerza.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function SobreEduardo() {
  return (
    <section id="sobre" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-noche-800">
            <Image
              src="/eduardo.jpg"
              alt="Dr. Eduardo Campos Hernández"
              width={600}
              height={800}
              className="h-full w-full object-cover object-center"
              priority
            />
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-lima-400">
            ¿Quién acompaña?
          </p>
          <h2 className="font-serif text-3xl text-white sm:text-5xl">
            <span className="titulo-plata">Dr. Eduardo</span>{" "}
            <em className="font-serif italic titulo-lima">Campos Hernández</em>
          </h2>

          <ul className="mt-6 space-y-2 text-sm text-white/70">
            <li>· Doctor en Alta Dirección</li>
            <li>· Maestro en Desarrollo Organizacional</li>
            <li>· Maestro en Administración de Negocios</li>
            <li>· Máster en Dirección y Gestión de Centros Educativos</li>
            <li>· Miembro de la International Coaching and Speaker Federation</li>
            <li>· Fundador del proyecto comunitario Raíces Vivas A.C. — León, Guanajuato</li>
          </ul>

          <div className="mt-7 space-y-4 leading-relaxed text-white/70">
            <p>
              Con más de <strong className="text-white">30 años de experiencia</strong> en el
              ámbito de la educación, la mentoría y el desarrollo humano, mi misión ha sido siempre
              la misma: ayudar a las personas a encontrar las palabras precisas para nombrar su
              futuro.
            </p>
            <p>
              A lo largo de mi trayectoria, he acompañado a cientos de jóvenes en su descubrimiento
              vocacional, a líderes en sus procesos de transición y a instituciones en la
              clarificación de su propósito. Superlativo nace como la síntesis metodológica de
              estas décadas de trabajo de campo, observación y acompañamiento estratégico.
            </p>
            <p>
              Mi enfoque no se basa en la motivación vacía, sino en el orden metodológico. Creo
              firmemente que la confusión no es falta de capacidad, sino exceso de ruido. Mi
              trabajo es ayudarte a despejarlo.
            </p>
          </div>

          <blockquote className="mt-7 border-l-2 border-lima-500/40 pl-5 font-serif italic text-lima-200">
            &ldquo;No hablo desde la teoría pura. Cada herramienta que uso, primero la apliqué en mi
            propia vida.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Testimonios() {
  const historias = [
    {
      nombre: "María Fernanda",
      texto:
        "Terminó su licenciatura, pero no veía con claridad cómo quería construir su vida. En Ruta Superlativa descubrió mejor sus fortalezas y hoy avanza con más dirección, reservando la siguiente etapa para decisiones futuras.",
    },
    {
      nombre: "Diego",
      texto:
        "Al terminar la preparatoria no sabía qué estudiar. Durante su año en Canadá trabajó la primera etapa para ganar claridad, y después definió la carrera y la institución que mejor se adaptaban a su perfil.",
    },
    {
      nombre: "Valeria",
      texto:
        "Dejó trunca la carrera de diseño y eso generó tensión con sus padres. En el proceso descubrió su ADN emprendedor; hoy crea libretas personalizadas en línea y, al mismo tiempo, estudia una licenciatura ejecutiva. Vive feliz aprendiendo y emprendiendo.",
    },
  ];

  return (
    <section className="border-t border-white/5 bg-noche-800/40 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl text-white sm:text-5xl">
            <span className="titulo-plata">Tres historias de</span>{" "}
            <em className="font-serif italic titulo-lima">claridad</em>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {historias.map(({ nombre, texto }) => (
            <article key={nombre} className="tarjeta-landing flex flex-col p-6">
              <Quote className="mb-3 h-6 w-6 text-lima-400/60" aria-hidden />
              <p className="flex-1 text-sm leading-relaxed text-white/70">{texto}</p>
              <p className="mt-4 font-serif text-lg text-lima-300">{nombre}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Los nombres se cambian para proteger la identidad.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Proceso() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-3xl text-white sm:text-4xl">
          <span className="titulo-plata">El primer paso es el más sencillo</span>
        </h2>
        <p className="mt-4 text-white/60">
          La primera conversación es de 30 minutos, sin costo y sin compromiso. Solo para
          conocernos y ver si el proceso tiene sentido para ti o para tu hijo.
        </p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { n: 1, t: "Escríbeme", d: "Por WhatsApp o correo." },
            { n: 2, t: "Conversación inicial", d: "30 min sin costo, presencial o video." },
            { n: 3, t: "Decidimos juntos", d: "Si tiene sentido, diseñamos el proceso." },
          ].map(({ n, t, d }) => (
            <li key={n} className="tarjeta-landing p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-lima-500/30 bg-lima-500/10 font-serif text-lima-300">
                {n}
              </span>
              <p className="mt-4 font-serif text-lg text-white">{t}</p>
              <p className="mt-1 text-sm text-white/60">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function CTAFinal() {
  return (
    <section id="contacto" className="border-y border-white/5 bg-noche-800/40 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-3xl text-white sm:text-5xl">
          <span className="titulo-plata">Empecemos con una</span>{" "}
          <em className="font-serif italic titulo-lima">conversación.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-white/60">
          Sin compromisos ni formatos rígidos. Un espacio para entender dónde estás y cómo el
          ecosistema Superlativo puede aportarte claridad.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE_WA)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tarjeta-landing flex flex-col items-center p-8 transition-all hover:border-lima-500/40 hover:bg-white/[0.05]"
          >
            <MessageCircle className="h-7 w-7 text-lima-400" aria-hidden />
            <p className="mt-3 font-serif text-xl text-white">WhatsApp</p>
            <p className="mt-1 text-sm text-white/60">+52 477 217 7331</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-lima-300">
              Escribir por WhatsApp <ChevronRight className="h-4 w-4" />
            </span>
          </a>
          <a
            href="mailto:contacto@superlativo.net"
            className="tarjeta-landing flex flex-col items-center p-8 transition-all hover:border-lima-500/40 hover:bg-white/[0.05]"
          >
            <Mail className="h-7 w-7 text-lima-400" aria-hidden />
            <p className="mt-3 font-serif text-xl text-white">Correo</p>
            <p className="mt-1 text-sm text-white/60">contacto@superlativo.net</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-lima-300">
              Enviar correo <ChevronRight className="h-4 w-4" />
            </span>
          </a>
        </div>
        <p className="mt-8 text-xs text-white/40">
          O sube y llena el formulario en la parte de arriba.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-noche-900 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image src="/logos/logo.png" alt="Superlativo" width={48} height={48} className="h-full w-full object-contain p-1" />
            </div>
            <p className="font-serif text-xl font-bold text-white">
              <span className="text-lima-400">S</span>uperlativo
            </p>
          </div>
          <p className="font-serif italic text-lima-300">&ldquo;Claridad es plenitud.&rdquo;</p>
          <p className="mt-3 text-xs text-white/40">León, Guanajuato · México</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Explorar</p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/70">
            <li><a href="#ecosistema" className="hover:text-lima-300">Ecosistema</a></li>
            <li><a href="#ruta" className="hover:text-lima-300">Ruta Superlativa</a></li>
            <li><a href="#fenix" className="hover:text-lima-300">Superlativo Fénix</a></li>
            <li><a href="#faro" className="hover:text-lima-300">FARO</a></li>
            <li><a href="#nexus" className="hover:text-lima-300">Nexus</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Contacto</p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/70">
            <li>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-lima-300">
                +52 477 217 7331
              </a>
            </li>
            <li>
              <a href="mailto:contacto@superlativo.net" className="hover:text-lima-300">
                contacto@superlativo.net
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-center text-xs text-white/30 sm:px-6">
        © {new Date().getFullYear()} Superlativo · Dr. Eduardo Campos Hernández
      </p>
    </footer>
  );
}

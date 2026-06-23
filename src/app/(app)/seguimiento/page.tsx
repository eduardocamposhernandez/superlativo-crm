import Link from "next/link";
import { ListChecks, AlarmClock, MessageCircle, Mail, Phone } from "lucide-react";
import { EncabezadoSeccion } from "@/components/ui/encabezado-seccion";
import { Badge, BadgeTemperatura } from "@/components/ui/badge";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { exigirSesion } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroPorRol } from "@/lib/permisos";
import { dinero, fechaCorta, diasEntre } from "@/lib/formato";

export default async function PaginaSeguimiento() {
  const u = await exigirSesion();
  const filtro = filtroPorRol(u);
  const ahora = new Date();
  const finHoy = new Date(); finHoy.setHours(23, 59, 59, 999);

  const [vencidos, hoy, sinSeguimiento, leadsLentos, citasHoy, recordatorios] = await Promise.all([
    db.cliente.findMany({
      where: {
        eliminadoEn: null,
        estadoCartera: "ACTIVO",
        proximaAccionEn: { lt: ahora },
        ...filtro,
      },
      orderBy: [{ temperatura: "asc" }, { valorEstimado: "desc" }],
      take: 50,
    }),
    db.cliente.findMany({
      where: {
        eliminadoEn: null,
        estadoCartera: "ACTIVO",
        proximaAccionEn: { gte: ahora, lte: finHoy },
        ...filtro,
      },
      orderBy: [{ temperatura: "asc" }, { valorEstimado: "desc" }],
      take: 50,
    }),
    db.cliente.findMany({
      where: {
        eliminadoEn: null,
        estadoCartera: "ACTIVO",
        proximaAccionEn: null,
        ...filtro,
      },
      orderBy: { creadoEn: "desc" },
      take: 30,
    }),
    db.cliente.findMany({
      where: {
        eliminadoEn: null,
        etapa: "NUEVO",
        estadoCartera: "ACTIVO",
        creadoEn: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        ultimoContacto: null,
        ...filtro,
      },
      take: 20,
    }),
    db.cita.findMany({
      where: {
        eliminadoEn: null,
        inicio: { gte: ahora, lte: finHoy },
        ...(u.rol === "VENDEDOR" ? { vendedorId: u.id } : {}),
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { inicio: "asc" },
    }),
    db.recordatorio.findMany({
      where: { usuarioId: u.id, hecho: false, cuando: { lte: finHoy } },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { cuando: "asc" },
    }),
  ]);

  const totalEnRiesgo = vencidos.length + sinSeguimiento.length + leadsLentos.length;

  return (
    <>
      <EncabezadoSeccion
        Icono={ListChecks}
        titulo="Hoy te toca"
        subtitulo="A quién contactar hoy"
        ayuda="Esta pestaña es la más importante. Ábrela cada mañana y contacta primero a los 🔥 calientes. El primero que llama, gana."
        colorMatiz="text-amber-600"
      />

      {totalEnRiesgo > 0 && (
        <div className="mb-4 rounded-2xl border border-peligro/30 bg-peligro-suave p-4 text-peligro dark:bg-peligro/10">
          <p className="text-sm font-semibold">
            ⚠ Llevas {totalEnRiesgo} clientes en riesgo de enfriarse
          </p>
          <p className="mt-1 text-xs">Atiéndelos hoy o se te van a la competencia.</p>
        </div>
      )}

      <Seccion
        Icono={AlarmClock}
        titulo={`Vencidos (${vencidos.length})`}
        ayuda="Acciones cuya fecha ya pasó. Atiéndelas YA."
        clientes={vencidos}
        tono="peligro"
      />
      <Seccion
        Icono={ListChecks}
        titulo={`Para hoy (${hoy.length})`}
        clientes={hoy}
        tono="aviso"
      />

      {leadsLentos.length > 0 && (
        <div className="mb-6 tarjeta border-aviso/30 bg-aviso-suave p-5 dark:bg-aviso/10">
          <p className="text-sm font-semibold text-aviso">⚠ Lead frío por demora ({leadsLentos.length})</p>
          <p className="mb-2 text-xs text-texto-suave">
            Llegaron como nuevos hace más de 24 h y nadie los ha contactado. El primero que escribe, gana.
          </p>
          <ul className="space-y-1 text-sm">
            {leadsLentos.map((c) => (
              <li key={c.id}>
                <Link href={`/clientes/${c.id}`} className="enlace-nombre">
                  → {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sinSeguimiento.length > 0 && (
        <Seccion
          Icono={ListChecks}
          titulo={`Sin próxima acción (${sinSeguimiento.length})`}
          ayuda="Estos clientes activos no tienen un siguiente paso definido. Cliquea su nombre y déjale una próxima acción."
          clientes={sinSeguimiento}
          tono="neutro"
        />
      )}

      {citasHoy.length > 0 && (
        <div className="mb-6 tarjeta p-5">
          <h2 className="mb-3 text-base font-semibold text-texto">Tus citas de hoy</h2>
          <ul className="space-y-2">
            {citasHoy.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border border-borde p-3">
                <div>
                  <p className="text-sm font-medium text-texto">
                    {c.cliente ? (
                      <Link href={`/clientes/${c.cliente.id}`} className="enlace-nombre">
                        {c.cliente.nombre}
                      </Link>
                    ) : (
                      c.nombreInvitado ?? "Cita"
                    )}
                  </p>
                  <p className="text-xs text-texto-suave">{fechaCorta(c.inicio)} · {c.titulo || "Sesión"}</p>
                </div>
                {c.ligaMeet && (
                  <a href={c.ligaMeet} target="_blank" rel="noopener noreferrer" className="boton boton-suave !min-h-[36px] !py-1.5 text-xs">
                    Meet
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recordatorios.length > 0 && (
        <div className="mb-6 tarjeta p-5">
          <h2 className="mb-3 text-base font-semibold text-texto">🔔 Recordatorios</h2>
          <ul className="space-y-2">
            {recordatorios.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-borde p-3">
                <div>
                  <p className="text-sm text-texto">{r.texto}</p>
                  <p className="text-xs text-texto-suave">
                    {fechaCorta(r.cuando)}
                    {r.cliente && (
                      <>
                        {" · "}
                        <Link href={`/clientes/${r.cliente.id}`} className="enlace-nombre">
                          {r.cliente.nombre}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalEnRiesgo === 0 && citasHoy.length === 0 && (
        <EstadoVacio icono={ListChecks} titulo="Hoy no tienes pendientes 🎉" descripcion="Aprovecha para sembrar: comparte tu landing o contacta un cliente frío." />
      )}
    </>
  );
}

interface ClienteFila {
  id: string;
  nombre: string;
  telefono: string | null;
  temperatura: string | null;
  proximaAccion: string | null;
  proximaAccionEn: Date | null;
  valorEstimado: number;
  ultimoContacto: Date | null;
}

function Seccion({
  Icono,
  titulo,
  ayuda,
  clientes,
  tono,
}: {
  Icono: typeof ListChecks;
  titulo: string;
  ayuda?: string;
  clientes: ClienteFila[];
  tono: "peligro" | "aviso" | "neutro";
}) {
  if (clientes.length === 0) return null;
  return (
    <div className="mb-6 tarjeta p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-texto">
        <Icono className="h-4 w-4 text-marca-600" /> {titulo}
      </h2>
      {ayuda && <p className="mb-3 text-xs text-texto-suave">{ayuda}</p>}
      <ul className="divide-y divide-borde">
        {clientes.map((c) => {
          const dias = c.ultimoContacto ? diasEntre(c.ultimoContacto) : null;
          return (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="flex-1">
                <Link href={`/clientes/${c.id}`} className="enlace-nombre">
                  {c.nombre}
                </Link>
                <p className="text-xs text-texto-suave">
                  {c.proximaAccion ?? "Sin próxima acción"}
                  {c.proximaAccionEn && ` · ${fechaCorta(c.proximaAccionEn)}`}
                  {dias !== null && dias > 7 && <span className="ml-1 text-peligro">· {dias}d sin contacto</span>}
                </p>
              </div>
              <BadgeTemperatura valor={c.temperatura as never} />
              <Badge tono={tono === "peligro" ? "peligro" : tono === "aviso" ? "aviso" : "neutro"}>
                {dinero(c.valorEstimado)}
              </Badge>
              {c.telefono && (
                <a
                  href={`https://wa.me/${c.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton boton-suave !min-h-[36px] !py-1.5 text-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
              {c.telefono && (
                <a href={`tel:${c.telefono}`} className="boton boton-fantasma !min-h-[36px] !py-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

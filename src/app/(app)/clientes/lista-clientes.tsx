"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Users, X, ArrowDownAZ, ArrowDownWideNarrow, AlarmClock } from "lucide-react";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { Badge, BadgeTemperatura } from "@/components/ui/badge";
import { dinero, fechaCorta, iniciales, telefonoBonito } from "@/lib/formato";

interface ClienteFila {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  empresaNombre: string | null;
  etapa: string;
  estadoCartera: string;
  temperatura: string | null;
  valorEstimado: number;
  proximaAccion: string | null;
  proximaAccionEn: Date | string | null;
  vendedor?: { nombre: string } | null;
  etiquetas: { etiqueta: { nombre: string; color: string } }[];
}

interface Datos {
  clientes: ClienteFila[];
  total: number;
  pagina: number;
  porPagina: number;
}

const ETAPAS = [
  ["NUEVO", "Nuevo"],
  ["CONTACTADO", "Contactado"],
  ["CITA_AGENDADA", "Cita agendada"],
  ["PROPUESTA_ENVIADA", "Propuesta enviada"],
  ["SEGUIMIENTO", "Seguimiento"],
] as const;

const TEMPS = [
  ["CALIENTE", "🔥 Caliente"],
  ["TIBIO", "🟡 Tibio"],
  ["FRIO", "🔵 Frío"],
] as const;

export function ListaClientes({ datos }: { datos: Datos }) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = useCallback(
    (clave: string, valor?: string) => {
      const p = new URLSearchParams(sp.toString());
      if (!valor) p.delete(clave);
      else p.set(clave, valor);
      p.delete("pagina");
      router.push(`/clientes?${p.toString()}`);
    },
    [router, sp],
  );

  const filtros = {
    etapa: sp.get("etapa"),
    temperatura: sp.get("temperatura"),
    etiqueta: sp.get("etiqueta"),
    favoritos: sp.get("favoritos"),
    vencida: sp.get("vencida"),
    orden: sp.get("orden"),
  };

  const algunFiltro =
    filtros.etapa || filtros.temperatura || filtros.etiqueta || filtros.favoritos || filtros.vencida;

  const ultimaPagina = Math.max(1, Math.ceil(datos.total / datos.porPagina));

  return (
    <>
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          aria-label="Filtrar por etapa"
          value={filtros.etapa ?? ""}
          onChange={(e) => setParam("etapa", e.target.value || undefined)}
          className="campo !w-auto !min-h-[40px] !py-2 text-sm"
        >
          <option value="">Etapa: todas</option>
          {ETAPAS.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por temperatura"
          value={filtros.temperatura ?? ""}
          onChange={(e) => setParam("temperatura", e.target.value || undefined)}
          className="campo !w-auto !min-h-[40px] !py-2 text-sm"
        >
          <option value="">Temperatura: todas</option>
          {TEMPS.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={() => setParam("vencida", filtros.vencida ? undefined : "1")}
          className={`boton !min-h-[40px] !py-2 text-sm ${filtros.vencida ? "boton-suave" : "boton-secundario"}`}
        >
          <AlarmClock className="h-4 w-4" /> Próxima acción vencida
        </button>
        <button
          onClick={() => setParam("favoritos", filtros.favoritos ? undefined : "1")}
          className={`boton !min-h-[40px] !py-2 text-sm ${filtros.favoritos ? "boton-suave" : "boton-secundario"}`}
        >
          ⭐ Favoritos
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-texto-suave">Ordenar:</span>
          <button
            onClick={() => setParam("orden", filtros.orden === "nombre" ? undefined : "nombre")}
            className={`boton !min-h-[36px] !py-1.5 text-xs ${filtros.orden === "nombre" ? "boton-suave" : "boton-fantasma"}`}
          >
            <ArrowDownAZ className="h-3.5 w-3.5" /> A-Z
          </button>
          <button
            onClick={() => setParam("orden", filtros.orden === "valor" ? undefined : "valor")}
            className={`boton !min-h-[36px] !py-1.5 text-xs ${filtros.orden === "valor" ? "boton-suave" : "boton-fantasma"}`}
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" /> Valor
          </button>
        </div>
      </div>

      {/* Chips de filtros activos */}
      {algunFiltro && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filtros.etapa && (
            <ChipFiltro etiqueta={`Etapa: ${filtros.etapa}`} alQuitar={() => setParam("etapa")} />
          )}
          {filtros.temperatura && (
            <ChipFiltro
              etiqueta={`Temp: ${filtros.temperatura}`}
              alQuitar={() => setParam("temperatura")}
            />
          )}
          {filtros.etiqueta && (
            <ChipFiltro
              etiqueta={`Etiqueta: ${filtros.etiqueta}`}
              alQuitar={() => setParam("etiqueta")}
            />
          )}
          {filtros.favoritos && (
            <ChipFiltro etiqueta="Solo favoritos" alQuitar={() => setParam("favoritos")} />
          )}
          {filtros.vencida && (
            <ChipFiltro etiqueta="Vencidos" alQuitar={() => setParam("vencida")} />
          )}
          <button
            onClick={() => router.push("/clientes")}
            className="text-xs text-marca-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {datos.clientes.length === 0 ? (
        <EstadoVacio
          icono={Users}
          titulo="Ningún cliente con estos filtros"
          descripcion="Prueba quitar alguno o crea tu primer cliente."
          accion={
            <Link href="/clientes/nuevo" className="boton boton-primario">
              + Nuevo cliente
            </Link>
          }
        />
      ) : (
        <>
          {/* Vista de tarjetas (móvil) */}
          <ul className="grid gap-3 lg:hidden">
            {datos.clientes.map((c) => (
              <li key={c.id}>
                <TarjetaClienteMovil c={c} />
              </li>
            ))}
          </ul>

          {/* Vista de tabla (desktop) */}
          <div className="hidden lg:block">
            <div className="tarjeta overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-borde bg-superficie/50 text-left text-xs uppercase tracking-wide text-texto-suave">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Contacto</th>
                    <th className="px-4 py-3 font-semibold">Etapa</th>
                    <th className="px-4 py-3 font-semibold">Temperatura</th>
                    <th className="px-4 py-3 font-semibold text-right">Valor</th>
                    <th className="px-4 py-3 font-semibold">Próxima acción</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.clientes.map((c) => (
                    <FilaCliente key={c.id} c={c} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-texto-suave sm:flex-row">
            <p>
              Mostrando {datos.clientes.length} de {datos.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={datos.pagina <= 1}
                onClick={() => setParam("pagina", String(datos.pagina - 1))}
                className="boton boton-secundario !min-h-[36px] !py-1.5 text-xs"
              >
                Anterior
              </button>
              <span>
                Página {datos.pagina} de {ultimaPagina}
              </span>
              <button
                disabled={datos.pagina >= ultimaPagina}
                onClick={() => setParam("pagina", String(datos.pagina + 1))}
                className="boton boton-secundario !min-h-[36px] !py-1.5 text-xs"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ChipFiltro({ etiqueta, alQuitar }: { etiqueta: string; alQuitar: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-marca-200 bg-marca-50 px-2.5 py-1 text-xs text-marca-700 dark:bg-marca-500/10 dark:text-marca-300 dark:border-marca-500/20">
      {etiqueta}
      <button
        onClick={alQuitar}
        aria-label="Quitar filtro"
        className="rounded-full p-0.5 hover:bg-marca-100 dark:hover:bg-marca-500/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilaCliente({ c }: { c: ClienteFila }) {
  const vencida =
    c.proximaAccionEn && new Date(c.proximaAccionEn).getTime() < Date.now();
  return (
    <tr className="border-b border-borde transition-colors hover:bg-superficie/50">
      <td className="px-4 py-3">
        <Link href={`/clientes/${c.id}`} className="enlace-nombre flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marca-100 text-xs font-semibold text-marca-700 dark:bg-marca-500/20 dark:text-marca-300">
            {iniciales(c.nombre)}
          </span>
          <span>
            {c.nombre}
            {c.empresaNombre && (
              <span className="block text-xs font-normal text-texto-suave">
                {c.empresaNombre}
              </span>
            )}
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 text-texto-suave">
        {c.telefono ? telefonoBonito(c.telefono) : "—"}
        {c.correo && <span className="block text-xs">{c.correo}</span>}
      </td>
      <td className="px-4 py-3">
        <Badge tono="marca">{c.etapa.replace(/_/g, " ")}</Badge>
      </td>
      <td className="px-4 py-3">
        <BadgeTemperatura valor={c.temperatura as never} />
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums">
        {dinero(c.valorEstimado)}
      </td>
      <td className="px-4 py-3">
        {c.proximaAccion ? (
          <>
            <p className={`text-sm ${vencida ? "text-peligro font-semibold" : "text-texto"}`}>
              {c.proximaAccion}
            </p>
            {c.proximaAccionEn && (
              <p className="text-xs text-texto-suave">{fechaCorta(c.proximaAccionEn)}</p>
            )}
          </>
        ) : (
          <span className="text-xs text-aviso">🟠 Sin seguimiento</span>
        )}
      </td>
    </tr>
  );
}

function TarjetaClienteMovil({ c }: { c: ClienteFila }) {
  const vencida =
    c.proximaAccionEn && new Date(c.proximaAccionEn).getTime() < Date.now();
  return (
    <Link href={`/clientes/${c.id}`} className="block tarjeta p-4 transition-shadow hover:shadow-elevada">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-marca-100 text-sm font-semibold text-marca-700 dark:bg-marca-500/20 dark:text-marca-300">
          {iniciales(c.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="enlace-nombre truncate">{c.nombre}</p>
          {c.empresaNombre && (
            <p className="truncate text-xs text-texto-suave">{c.empresaNombre}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tono="marca">{c.etapa.replace(/_/g, " ")}</Badge>
            <BadgeTemperatura valor={c.temperatura as never} />
          </div>
          {c.proximaAccion && (
            <p className={`mt-2 text-xs ${vencida ? "text-peligro font-semibold" : "text-texto-suave"}`}>
              📌 {c.proximaAccion}
              {c.proximaAccionEn && ` · ${fechaCorta(c.proximaAccionEn)}`}
            </p>
          )}
        </div>
        <p className="text-sm font-bold tabular-nums text-marca-600">
          {dinero(c.valorEstimado)}
        </p>
      </div>
    </Link>
  );
}

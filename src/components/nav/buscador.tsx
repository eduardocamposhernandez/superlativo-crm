"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Users,
  CalendarDays,
  Wallet,
  FileText,
  Tag,
  Plus,
} from "lucide-react";
import { fechaCorta, dinero } from "@/lib/formato";

interface Resultado {
  tipo: "cliente" | "cita" | "pago" | "nota" | "etiqueta";
  id: string;
  titulo: string;
  subtitulo?: string;
  href: string;
}

interface Grupo {
  titulo: string;
  Icono: typeof Users;
  resultados: Resultado[];
}

interface Props {
  abierto: boolean;
  alCerrar: () => void;
}

const CLAVE_RECIENTES = "superlativo-busquedas-recientes";

export function Buscador({ abierto, alCerrar }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [seleccion, setSeleccion] = useState(0);
  const [recientes, setRecientes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Atajo global "/" o Ctrl/Cmd+K
  useEffect(() => {
    if (!abierto) {
      setQ("");
      setGrupos([]);
      setSeleccion(0);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
      try {
        const r = JSON.parse(localStorage.getItem(CLAVE_RECIENTES) || "[]");
        setRecientes(r);
      } catch {
        setRecientes([]);
      }
    }
  }, [abierto]);

  // Esc cierra
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, alCerrar]);

  // Debounce de búsqueda
  useEffect(() => {
    if (!q.trim()) {
      setGrupos([]);
      return;
    }
    const t = setTimeout(async () => {
      setCargando(true);
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        if (j.ok) {
          const g: Grupo[] = [];
          if (j.data.clientes?.length) {
            g.push({
              titulo: "Clientes",
              Icono: Users,
              resultados: j.data.clientes.map((c: { id: string; nombre: string; telefono: string; empresaNombre: string }) => ({
                tipo: "cliente",
                id: c.id,
                titulo: c.nombre,
                subtitulo: [c.empresaNombre, c.telefono].filter(Boolean).join(" · "),
                href: `/clientes/${c.id}`,
              })),
            });
          }
          if (j.data.citas?.length) {
            g.push({
              titulo: "Citas",
              Icono: CalendarDays,
              resultados: j.data.citas.map((c: { id: string; titulo: string; inicio: string; clienteId?: string }) => ({
                tipo: "cita",
                id: c.id,
                titulo: c.titulo,
                subtitulo: fechaCorta(c.inicio),
                href: c.clienteId ? `/clientes/${c.clienteId}` : `/agenda`,
              })),
            });
          }
          if (j.data.pagos?.length) {
            g.push({
              titulo: "Pagos",
              Icono: Wallet,
              resultados: j.data.pagos.map((p: { id: string; clienteId: string; clienteNombre: string; monto: number }) => ({
                tipo: "pago",
                id: p.id,
                titulo: `${p.clienteNombre} — ${dinero(p.monto)}`,
                href: `/clientes/${p.clienteId}`,
              })),
            });
          }
          if (j.data.notas?.length) {
            g.push({
              titulo: "Notas",
              Icono: FileText,
              resultados: j.data.notas.map((n: { id: string; clienteId: string; clienteNombre: string; contenido: string }) => ({
                tipo: "nota",
                id: n.id,
                titulo: n.clienteNombre,
                subtitulo: n.contenido.slice(0, 80),
                href: `/clientes/${n.clienteId}`,
              })),
            });
          }
          if (j.data.etiquetas?.length) {
            g.push({
              titulo: "Etiquetas",
              Icono: Tag,
              resultados: j.data.etiquetas.map((e: { id: string; nombre: string; cantidad: number }) => ({
                tipo: "etiqueta",
                id: e.id,
                titulo: e.nombre,
                subtitulo: `${e.cantidad} clientes`,
                href: `/clientes?etiqueta=${encodeURIComponent(e.nombre)}`,
              })),
            });
          }
          setGrupos(g);
          setSeleccion(0);
        }
      } catch {
        setGrupos([]);
      } finally {
        setCargando(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const ir = useCallback(
    (href: string) => {
      // Guardar reciente
      if (q.trim()) {
        const nuevos = [q, ...recientes.filter((r) => r !== q)].slice(0, 6);
        setRecientes(nuevos);
        try {
          localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(nuevos));
        } catch {
          /* */
        }
      }
      alCerrar();
      router.push(href);
    },
    [alCerrar, q, recientes, router],
  );

  const todos = grupos.flatMap((g) => g.resultados);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeleccion((s) => Math.min(s + 1, todos.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeleccion((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = todos[seleccion];
      if (r) ir(r.href);
    }
  }

  if (!abierto || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-label="Buscador"
      className="fixed inset-0 z-50 flex items-start justify-center p-0 pt-[10vh] sm:p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={alCerrar} aria-hidden />
      <div className="relative w-full max-w-2xl tarjeta animate-aparecer">
        <div className="flex items-center gap-3 border-b border-borde p-4">
          <Search className="h-5 w-5 text-texto-suave" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            placeholder="Busca cliente, teléfono, correo, empresa, nota…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-base text-texto outline-none placeholder:text-texto-tenue"
            aria-label="Buscar"
          />
          <kbd className="hidden rounded-md border border-borde px-1.5 py-0.5 text-[10px] text-texto-tenue sm:inline">
            Esc
          </kbd>
          <button onClick={alCerrar} aria-label="Cerrar" className="rounded-lg p-1 text-texto-suave hover:text-texto">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q.trim() && recientes.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-texto-tenue">
                Búsquedas recientes
              </p>
              {recientes.map((r) => (
                <button
                  key={r}
                  onClick={() => setQ(r)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-texto hover:bg-superficie"
                >
                  <Search className="h-4 w-4 text-texto-tenue" /> {r}
                </button>
              ))}
            </div>
          )}

          {q.trim() && cargando && (
            <div className="p-6 text-center text-sm text-texto-suave">Buscando…</div>
          )}

          {q.trim() && !cargando && todos.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-texto-suave">
                No encontré nada con <strong>&ldquo;{q}&rdquo;</strong>. Revisa cómo lo escribiste o crea un cliente nuevo.
              </p>
              <button
                onClick={() => ir(`/clientes/nuevo?nombre=${encodeURIComponent(q)}`)}
                className="boton boton-primario !min-h-[40px]"
              >
                <Plus className="h-4 w-4" /> Nuevo cliente
              </button>
            </div>
          )}

          {grupos.map((g) => {
            let indiceGlobalInicio = 0;
            for (const ant of grupos) {
              if (ant === g) break;
              indiceGlobalInicio += ant.resultados.length;
            }
            return (
              <div key={g.titulo} className="p-2">
                <div className="flex items-center gap-2 px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-texto-tenue">
                  <g.Icono className="h-3.5 w-3.5" /> {g.titulo}
                </div>
                {g.resultados.map((r, i) => {
                  const idx = indiceGlobalInicio + i;
                  return (
                    <button
                      key={r.id}
                      onMouseEnter={() => setSeleccion(idx)}
                      onClick={() => ir(r.href)}
                      className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left ${
                        seleccion === idx ? "bg-marca-50 dark:bg-marca-500/10" : "hover:bg-superficie"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-texto">
                          <Resaltado texto={r.titulo} consulta={q} />
                        </p>
                        {r.subtitulo && (
                          <p className="text-xs text-texto-suave">
                            <Resaltado texto={r.subtitulo} consulta={q} />
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Resaltado({ texto, consulta }: { texto: string; consulta: string }) {
  if (!consulta.trim()) return <>{texto}</>;
  const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = sinAcentos(consulta);
  const t = sinAcentos(texto);
  const i = t.indexOf(q);
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark className="rounded bg-marca-100 px-0.5 text-marca-800 dark:bg-marca-500/30 dark:text-marca-200">
        {texto.slice(i, i + consulta.length)}
      </mark>
      {texto.slice(i + consulta.length)}
    </>
  );
}

// Atajo global (montado una sola vez en el layout)
export function AtajoBuscador() {
  const [, forzar] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const enCampo = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (!enCampo && e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("abrir-buscador"));
        forzar((n) => n + 1);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("abrir-buscador"));
      }
      if (!enCampo && e.key === "?") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("abrir-ayuda"));
      }
      if (!enCampo && (e.key === "n" || e.key === "N")) {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          window.location.href = "/clientes/nuevo";
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

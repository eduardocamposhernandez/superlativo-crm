"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { hora, fechaCorta } from "@/lib/formato";

interface Cita {
  id: string;
  inicio: Date | string;
  duracionMin: number;
  titulo: string | null;
  estado: string;
  clienteId: string | null;
  clienteNombre: string;
}

interface Props {
  citas: Cita[];
  horarioInicio: string; // "09:00"
  horarioFin: string; // "18:00"
  duracionMin: number;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function Calendario({ citas, horarioInicio, horarioFin, duracionMin }: Props) {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [diaSel, setDiaSel] = useState<Date | null>(null);

  const citasMap = useMemo(() => {
    const m: Record<string, Cita[]> = {};
    for (const c of citas) {
      const d = new Date(c.inicio);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (m[k] ??= []).push(c);
    }
    return m;
  }, [citas]);

  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const offset = (primerDia.getDay() + 6) % 7; // Lunes = 0
  const totalDias = ultimoDia.getDate();
  const celdas: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => new Date(anio, mes, i + 1)),
  ];

  function avanzar(dir: number) {
    let m = mes + dir, y = anio;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMes(m); setAnio(y);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Boton tamano="sm" variante="secundario" onClick={() => avanzar(-1)} iconoIzq={<ChevronLeft className="h-4 w-4" />}>
            Anterior
          </Boton>
          <h2 className="text-lg font-bold text-texto">{MESES[mes]} {anio}</h2>
          <Boton tamano="sm" variante="secundario" onClick={() => avanzar(1)} iconoDer={<ChevronRight className="h-4 w-4" />}>
            Siguiente
          </Boton>
        </div>
        <Boton tamano="sm" variante="suave" onClick={() => { setMes(hoy.getMonth()); setAnio(hoy.getFullYear()); }}>
          Hoy
        </Boton>
      </div>

      <div className="tarjeta overflow-hidden">
        <div className="grid grid-cols-7 border-b border-borde bg-superficie/50 text-center text-xs font-medium text-texto-suave">
          {DIAS.map((d) => (
            <div key={d} className="border-r border-borde p-2 last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celdas.map((d, i) => {
            const k = d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : "";
            const cs = d ? (citasMap[k] || []) : [];
            const esHoy = d && d.toDateString() === hoy.toDateString();
            const findeSemana = d && (d.getDay() === 0 || d.getDay() === 6);
            return (
              <button
                key={i}
                onClick={() => d && setDiaSel(d)}
                disabled={!d}
                className={`relative min-h-[80px] border-b border-r border-borde p-2 text-left transition-colors ${
                  d ? "hover:bg-superficie cursor-pointer" : "bg-superficie/30 cursor-default"
                } ${findeSemana ? "bg-superficie/30" : ""}`}
              >
                {d && (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        esHoy ? "bg-marca-500 text-white font-semibold" : "text-texto"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {cs.slice(0, 2).map((c) => (
                        <li
                          key={c.id}
                          className="truncate rounded-md bg-marca-50 px-1 py-0.5 text-[10px] text-marca-700 dark:bg-marca-500/20 dark:text-marca-300"
                        >
                          {hora(c.inicio)} {c.clienteNombre}
                        </li>
                      ))}
                      {cs.length > 2 && (
                        <li className="text-[10px] text-texto-suave">+{cs.length - 2} más</li>
                      )}
                    </ul>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <ModalDia
        dia={diaSel}
        alCerrar={() => setDiaSel(null)}
        citas={diaSel ? citasMap[`${diaSel.getFullYear()}-${diaSel.getMonth()}-${diaSel.getDate()}`] || [] : []}
        horarioInicio={horarioInicio}
        horarioFin={horarioFin}
        duracionMin={duracionMin}
      />
    </>
  );
}

function ModalDia({
  dia,
  alCerrar,
  citas,
  horarioInicio,
  horarioFin,
  duracionMin,
}: {
  dia: Date | null;
  alCerrar: () => void;
  citas: Cita[];
  horarioInicio: string;
  horarioFin: string;
  duracionMin: number;
}) {
  const toast = useToast();
  const [agendando, setAgendando] = useState<string | null>(null);

  if (!dia) return null;

  const [hi, mi] = horarioInicio.split(":").map(Number);
  const [hf, mf] = horarioFin.split(":").map(Number);
  const slots: string[] = [];
  let mins = hi * 60 + mi;
  const finMins = hf * 60 + mf;
  while (mins + duracionMin <= finMins) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    mins += duracionMin;
  }
  const ocupados = new Set(citas.map((c) => hora(c.inicio)));

  async function agendarRapido(slot: string) {
    if (!dia) return;
    setAgendando(slot);
    alCerrar();
    const iso = new Date(`${dia.toISOString().slice(0, 10)}T${slot}:00`).toISOString();
    window.location.href = `/agenda/nueva?inicio=${encodeURIComponent(iso)}`;
  }

  return (
    <Modal abierto={!!dia} alCerrar={alCerrar} titulo={fechaCorta(dia)}>
      <p className="mb-3 text-sm text-texto-suave">
        Citas del día: {citas.length}. Toca un hueco libre para agendar.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((s) => {
          const ocupado = ocupados.has(s);
          if (ocupado) {
            const c = citas.find((c) => hora(c.inicio) === s)!;
            return (
              <Link
                key={s}
                href={c.clienteId ? `/clientes/${c.clienteId}` : "#"}
                className="rounded-xl border border-marca-500 bg-marca-50 p-2 text-xs dark:bg-marca-500/20"
              >
                <strong>{s}</strong>
                <p className="truncate">{c.clienteNombre}</p>
              </Link>
            );
          }
          return (
            <button
              key={s}
              onClick={() => agendarRapido(s)}
              className="rounded-xl border border-borde p-2 text-xs hover:bg-marca-50 dark:hover:bg-marca-500/10"
            >
              <Plus className="mx-auto h-3 w-3" /> {s}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

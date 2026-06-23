"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dinero, diasEntre } from "@/lib/formato";
import { Badge, BadgeTemperatura } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const ETAPAS = [
  ["NUEVO", "Nuevo"],
  ["CONTACTADO", "Contactado"],
  ["CITA_AGENDADA", "Cita agendada"],
  ["PROPUESTA_ENVIADA", "Propuesta enviada"],
  ["SEGUIMIENTO", "Seguimiento"],
] as const;

interface ClienteCard {
  id: string;
  nombre: string;
  etapa: string;
  temperatura: string | null;
  valorEstimado: number;
  proximaAccion: string | null;
  proximaAccionEn: Date | string | null;
  empresaNombre: string | null;
  ultimoContacto: Date | string | null;
}

export function Embudo({
  clientes,
  umbralEstancamientoDias,
}: {
  clientes: ClienteCard[];
  umbralEstancamientoDias: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [optimistas, setOptimistas] = useState<Record<string, string>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  const porEtapa = useMemo(() => {
    const mapa: Record<string, ClienteCard[]> = {};
    for (const [e] of ETAPAS) mapa[e] = [];
    for (const c of clientes) {
      const etapaReal = optimistas[c.id] ?? c.etapa;
      if (mapa[etapaReal]) mapa[etapaReal].push({ ...c, etapa: etapaReal });
    }
    return mapa;
  }, [clientes, optimistas]);

  function alIniciar(e: DragStartEvent) {
    setArrastrando(String(e.active.id));
  }

  async function alSoltar(e: DragEndEvent) {
    setArrastrando(null);
    if (!e.over) return;
    const id = String(e.active.id);
    const nueva = String(e.over.id);
    const actual = clientes.find((c) => c.id === id);
    if (!actual || actual.etapa === nueva) return;

    setOptimistas((p) => ({ ...p, [id]: nueva }));
    const r = await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _accion: "etapa", etapa: nueva }),
    });
    const j = await r.json();
    if (!j.ok) {
      setOptimistas((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      toast.error("No pudimos mover. Intenta de nuevo.");
      return;
    }
    toast.exito(`${actual.nombre} movido a "${nueva.replace(/_/g, " ").toLowerCase()}"`);
    router.refresh();
  }

  const card = arrastrando ? clientes.find((c) => c.id === arrastrando) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={alIniciar} onDragEnd={alSoltar}>
      <div className="flex gap-3 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible">
        {ETAPAS.map(([id, etiqueta]) => (
          <Columna
            key={id}
            id={id}
            etiqueta={etiqueta}
            clientes={porEtapa[id]}
            umbral={umbralEstancamientoDias}
          />
        ))}
      </div>
      <DragOverlay>
        {card && <Tarjeta cliente={card} arrastrando umbral={umbralEstancamientoDias} />}
      </DragOverlay>
    </DndContext>
  );
}

function Columna({
  id,
  etiqueta,
  clientes,
  umbral,
}: {
  id: string;
  etiqueta: string;
  clientes: ClienteCard[];
  umbral: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const total = clientes.reduce((s, c) => s + (c.valorEstimado || 0), 0);
  return (
    <div className="w-72 flex-shrink-0 lg:w-auto">
      <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold text-texto">{etiqueta}</h3>
        <span className="text-xs text-texto-tenue">{clientes.length}</span>
      </div>
      <p className="mb-2 px-1 text-xs font-medium text-marca-700 dark:text-marca-300">
        {dinero(total)}
      </p>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-2 rounded-2xl border bg-superficie/40 p-2 transition-colors ${
          isOver ? "border-marca-500 bg-marca-50 dark:bg-marca-500/10" : "border-borde"
        }`}
      >
        {clientes.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-texto-tenue">
            (Vacío — arrastra aquí)
          </p>
        )}
        {clientes.map((c) => (
          <Arrastrable key={c.id} id={c.id}>
            <Tarjeta cliente={c} umbral={umbral} />
          </Arrastrable>
        ))}
      </div>
    </div>
  );
}

function Arrastrable({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.3 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      {children}
    </div>
  );
}

function Tarjeta({
  cliente,
  arrastrando,
  umbral,
}: {
  cliente: ClienteCard;
  arrastrando?: boolean;
  umbral: number;
}) {
  const vencida =
    cliente.proximaAccionEn && new Date(cliente.proximaAccionEn).getTime() < Date.now();
  const estancado =
    cliente.ultimoContacto && diasEntre(cliente.ultimoContacto) > umbral;
  return (
    <div
      className={`tarjeta cursor-grab p-3 transition-shadow ${
        arrastrando ? "rotate-2 shadow-flotante" : "hover:shadow-elevada"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/clientes/${cliente.id}`} onClick={(e) => e.stopPropagation()} className="enlace-nombre text-sm">
          {cliente.nombre}
        </Link>
        <BadgeTemperatura valor={cliente.temperatura as never} />
      </div>
      {cliente.empresaNombre && (
        <p className="mt-0.5 text-xs text-texto-suave truncate">{cliente.empresaNombre}</p>
      )}
      <p className="mt-1 text-sm font-semibold tabular-nums text-marca-600">
        {dinero(cliente.valorEstimado)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {vencida && <Badge tono="peligro">⏰ Vencida</Badge>}
        {estancado && <Badge tono="neutro">🕒 {diasEntre(cliente.ultimoContacto!)} días sin avanzar</Badge>}
        {!cliente.proximaAccion && <Badge tono="aviso">🟠 Sin seguimiento</Badge>}
      </div>
    </div>
  );
}

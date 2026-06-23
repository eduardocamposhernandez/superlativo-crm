"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy } from "lucide-react";

export function CelebracionGanado({
  activo,
  alTerminar,
  nombre,
}: {
  activo: boolean;
  alTerminar: () => void;
  nombre: string;
}) {
  const [piezas, setPiezas] = useState<{ id: number; x: number; r: number; c: string; d: number }[]>([]);
  const [reducir, setReducir] = useState(false);

  useEffect(() => {
    if (!activo) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducir(mq.matches);
    if (!mq.matches) {
      const colores = ["#3fbf8f", "#34d399", "#fbbf24", "#60a5fa", "#f472b6"];
      const ps = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        r: Math.random() * 360,
        c: colores[Math.floor(Math.random() * colores.length)],
        d: Math.random() * 0.6,
      }));
      setPiezas(ps);
    }
    const t = setTimeout(alTerminar, 1800);
    return () => clearTimeout(t);
  }, [activo, alTerminar]);

  if (!activo || typeof window === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
      {!reducir &&
        piezas.map((p) => (
          <span
            key={p.id}
            className="absolute h-2 w-2 rounded-sm"
            style={{
              left: `${p.x}%`,
              top: "-5%",
              background: p.c,
              transform: `rotate(${p.r}deg)`,
              animation: `caer 1.6s ${p.d}s linear forwards`,
            }}
          />
        ))}
      <div className="tarjeta bg-marca-500 text-white p-8 text-center shadow-flotante animate-aparecer">
        <Trophy className="mx-auto h-16 w-16" aria-hidden />
        <p className="mt-2 text-2xl font-bold">¡Cerraste a {nombre}!</p>
        <p className="text-sm opacity-90">Anótalo. Hoy se siente bien.</p>
      </div>
      <style jsx>{`
        @keyframes caer {
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}

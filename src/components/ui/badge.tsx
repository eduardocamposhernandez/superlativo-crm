import { type ReactNode } from "react";

type Tono =
  | "neutro"
  | "marca"
  | "exito"
  | "peligro"
  | "aviso"
  | "info"
  | "caliente"
  | "tibio"
  | "frio";

interface Props {
  tono?: Tono;
  icono?: ReactNode;
  children: ReactNode;
  className?: string;
}

const tonos: Record<Tono, string> = {
  neutro: "bg-superficie text-texto-suave border-borde",
  marca: "bg-marca-50 text-marca-700 border-marca-200 dark:bg-marca-500/10 dark:text-marca-300 dark:border-marca-500/20",
  exito: "bg-exito-suave text-exito border-exito/30 dark:bg-exito/10",
  peligro: "bg-peligro-suave text-peligro border-peligro/30 dark:bg-peligro/10",
  aviso: "bg-aviso-suave text-aviso border-aviso/30 dark:bg-aviso/10",
  info: "bg-info-suave text-info border-info/30 dark:bg-info/10",
  caliente: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
  tibio: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  frio: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
};

export function Badge({ tono = "neutro", icono, children, className = "" }: Props) {
  return (
    <span className={`badge border ${tonos[tono]} ${className}`}>
      {icono}
      {children}
    </span>
  );
}

export function BadgeTemperatura({ valor }: { valor: "CALIENTE" | "TIBIO" | "FRIO" | null | undefined }) {
  if (!valor) return <Badge tono="neutro">Sin clasificar</Badge>;
  if (valor === "CALIENTE") return <Badge tono="caliente">🔥 Caliente</Badge>;
  if (valor === "TIBIO") return <Badge tono="tibio">🟡 Tibio</Badge>;
  return <Badge tono="frio">🔵 Frío</Badge>;
}

export function BadgeEstado({ valor }: { valor: "ACTIVO" | "GANADO" | "PERDIDO" | "ARCHIVADO" }) {
  if (valor === "GANADO") return <Badge tono="exito">✓ Ganado</Badge>;
  if (valor === "PERDIDO") return <Badge tono="neutro">✕ Perdido</Badge>;
  if (valor === "ARCHIVADO") return <Badge tono="neutro">📁 Archivado</Badge>;
  return <Badge tono="marca">● Activo</Badge>;
}

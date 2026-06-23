/**
 * Utilidades para formatear fechas, dinero y números en español.
 * NUNCA inventes formatos: úsalas siempre desde aquí.
 */

const LOCALE = "es-MX";

export function dinero(monto: number, moneda = "MXN"): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(monto || 0);
}

export function numero(n: number): string {
  return new Intl.NumberFormat(LOCALE).format(n || 0);
}

export function porcentaje(n: number, decimales = 0): string {
  return `${(n * 100).toFixed(decimales)}%`;
}

export function fechaCorta(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const f = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(f);
}

export function fechaCortaSinAnio(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const f = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
  }).format(f);
}

export function fechaHora(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const f = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(f);
}

export function hora(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const f = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(f);
}

/** "Hoy 3:40 pm", "Ayer", "Lun 9 jun", "hace 3 días" */
export function fechaRelativa(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const f = typeof d === "string" ? new Date(d) : d;
  const ahora = new Date();
  const ms = ahora.getTime() - f.getTime();
  const min = Math.round(ms / 60000);
  const horas = Math.round(min / 60);
  const dias = Math.round(horas / 24);

  if (min < 1 && min > -1) return "Ahora mismo";
  if (min > 0 && min < 60) return `Hace ${min} min`;
  if (min < 0 && min > -60) return `En ${Math.abs(min)} min`;

  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const fechaSinHora = new Date(f.getFullYear(), f.getMonth(), f.getDate());
  const diffDias = Math.round((hoy.getTime() - fechaSinHora.getTime()) / 86400000);

  if (diffDias === 0) return `Hoy ${hora(f)}`;
  if (diffDias === 1) return `Ayer ${hora(f)}`;
  if (diffDias === -1) return `Mañana ${hora(f)}`;
  if (diffDias > 1 && diffDias < 7) return `Hace ${diffDias} días`;
  if (diffDias < -1 && diffDias > -7) return `En ${Math.abs(diffDias)} días`;
  return fechaCorta(f);
}

export function diasEntre(a: Date | string, b: Date | string = new Date()): number {
  const fa = typeof a === "string" ? new Date(a) : a;
  const fb = typeof b === "string" ? new Date(b) : b;
  return Math.floor((fb.getTime() - fa.getTime()) / 86400000);
}

export function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function quitarAcentos(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Normaliza teléfono: solo dígitos. Devuelve formato internacional sin signos */
export function normalizarTelefono(tel: string): string {
  return (tel || "").replace(/\D/g, "");
}

/** "+52 33 1234 5678" — muestra bonito */
export function telefonoBonito(tel: string): string {
  const d = normalizarTelefono(tel);
  if (d.length === 12 && d.startsWith("52")) {
    return `+52 ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
  }
  if (d.length === 10) return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
  return tel;
}

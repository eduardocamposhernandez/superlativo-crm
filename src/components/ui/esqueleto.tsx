export function Esqueleto({ className = "" }: { className?: string }) {
  return <div className={`esqueleto ${className}`} aria-hidden />;
}

export function EsqueletoLineas({ filas = 3 }: { filas?: number }) {
  return (
    <div className="space-y-2" aria-label="Cargando…">
      {Array.from({ length: filas }).map((_, i) => (
        <Esqueleto key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function EsqueletoTarjeta() {
  return (
    <div className="tarjeta space-y-3 p-5" aria-label="Cargando…">
      <Esqueleto className="h-5 w-1/3" />
      <Esqueleto className="h-3 w-full" />
      <Esqueleto className="h-3 w-2/3" />
    </div>
  );
}

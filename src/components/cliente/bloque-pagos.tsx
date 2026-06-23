"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Plus, Printer, Trash2 } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useConfirmar } from "@/components/ui/confirmar";
import { dinero, fechaCorta } from "@/lib/formato";

interface Pago {
  id: string;
  monto: number;
  metodo: string;
  estado: string;
  fechaPago: Date | string | null;
  concepto: string | null;
}

export function BloquePagos({
  clienteId,
  pagos,
  valorEstimado,
}: {
  clienteId: string;
  pagos: Pago[];
  valorEstimado: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [agregando, setAgregando] = useState(false);

  const cobrado = pagos.filter((p) => p.estado === "PAGADO").reduce((s, p) => s + p.monto, 0);
  const pendiente = Math.max(0, valorEstimado - cobrado);
  const pct = valorEstimado > 0 ? Math.min(100, (cobrado / valorEstimado) * 100) : 0;

  async function borrar(id: string) {
    const ok = await confirmar({
      titulo: "¿Borrar este pago?",
      mensaje: "Se enviará a papelera.",
      peligro: true,
    });
    if (!ok) return;
    await fetch(`/api/pagos/${id}`, { method: "DELETE" });
    toast.exito("Pago borrado");
    router.refresh();
  }

  function imprimirRecibo(p: Pago) {
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Recibo</title>
      <style>body{font-family:system-ui;padding:40px;color:#111}h1{color:#3fbf8f}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:8px;border-bottom:1px solid #e5e7eb}</style>
    </head><body>
      <h1>SUPERLATIVO</h1>
      <p>Recibo de pago — Folio ${p.id.slice(-8).toUpperCase()}</p>
      <table>
        <tr><td><strong>Cliente ID</strong></td><td>${clienteId}</td></tr>
        <tr><td><strong>Concepto</strong></td><td>${p.concepto ?? "—"}</td></tr>
        <tr><td><strong>Método</strong></td><td>${p.metodo}</td></tr>
        <tr><td><strong>Monto</strong></td><td><strong>${dinero(p.monto)}</strong></td></tr>
        <tr><td><strong>Fecha</strong></td><td>${p.fechaPago ? fechaCorta(p.fechaPago) : "—"}</td></tr>
        <tr><td><strong>Estado</strong></td><td>${p.estado}</td></tr>
      </table>
      <p style="margin-top:40px;color:#6b7280;font-size:12px">Gracias por confiar en Superlativo.</p>
      <script>window.print();</script>
    </body></html>`);
    w.document.close();
  }

  return (
    <div className="tarjeta p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-texto">
          <Wallet className="h-4 w-4 text-marca-600" /> Pagos
        </h2>
        <Boton tamano="sm" variante="suave" onClick={() => setAgregando(true)} iconoIzq={<Plus className="h-4 w-4" />}>
          Registrar pago
        </Boton>
      </div>

      {/* Progreso */}
      <div className="mb-4 rounded-xl border border-borde bg-superficie p-3">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-texto-suave">Pagado</span>
          <strong className="tabular-nums text-marca-700">{dinero(cobrado)}</strong>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-borde">
          <div className="h-full bg-marca-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2 text-xs text-texto-suave">
          <span>{Math.round(pct)}% del valor estimado</span>
          <span>Falta: {dinero(pendiente)}</span>
        </div>
      </div>

      {pagos.length === 0 ? (
        <p className="text-sm text-texto-suave">Sin pagos aún. Cuando cobres, regístralo aquí.</p>
      ) : (
        <ul className="space-y-2">
          {pagos.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-borde p-3"
            >
              <div className="flex-1">
                <p className="font-semibold tabular-nums text-texto">{dinero(p.monto)}</p>
                <p className="text-xs text-texto-suave">
                  {p.metodo} · {p.fechaPago ? fechaCorta(p.fechaPago) : "Sin fecha"}
                  {p.concepto && ` · ${p.concepto}`}
                </p>
              </div>
              <Badge
                tono={p.estado === "PAGADO" ? "exito" : p.estado === "VENCIDO" ? "peligro" : "aviso"}
              >
                {p.estado}
              </Badge>
              <button onClick={() => imprimirRecibo(p)} className="boton boton-fantasma !min-h-[36px] !py-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" /> Recibo
              </button>
              <button onClick={() => borrar(p.id)} aria-label="Borrar pago" className="text-texto-tenue hover:text-peligro">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ModalNuevoPago
        abierto={agregando}
        alCerrar={() => setAgregando(false)}
        clienteId={clienteId}
        alGuardar={() => {
          setAgregando(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function ModalNuevoPago({
  abierto,
  alCerrar,
  clienteId,
  alGuardar,
}: {
  abierto: boolean;
  alCerrar: () => void;
  clienteId: string;
  alGuardar: () => void;
}) {
  const toast = useToast();
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("Transferencia");
  const [estado, setEstado] = useState("PAGADO");
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [concepto, setConcepto] = useState("");
  const [cargando, setCargando] = useState(false);

  async function guardar() {
    setCargando(true);
    const r = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId,
        monto: Number(monto),
        metodo,
        estado,
        fechaPago: estado === "PAGADO" ? new Date(fechaPago).toISOString() : null,
        concepto,
      }),
    });
    const j = await r.json();
    setCargando(false);
    if (!j.ok) {
      toast.error(j.mensaje);
      return;
    }
    toast.exito("Pago registrado ✓");
    alGuardar();
  }

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Registrar pago"
      pieDePagina={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton onClick={guardar} cargando={cargando} disabled={!monto}>
            Guardar pago
          </Boton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="etiqueta-campo">Monto</label>
          <input
            type="number"
            min={0}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="campo"
            placeholder="5000"
          />
        </div>
        <div>
          <label className="etiqueta-campo">Método</label>
          <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className="campo">
            <option>Transferencia</option>
            <option>Tarjeta</option>
            <option>Liga de pago (Stripe/Mercado Pago)</option>
            <option>Efectivo</option>
          </select>
        </div>
        <div>
          <label className="etiqueta-campo">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="campo">
            <option value="PAGADO">Pagado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VENCIDO">Vencido</option>
          </select>
        </div>
        {estado === "PAGADO" && (
          <div>
            <label className="etiqueta-campo">Fecha del pago</label>
            <input
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="campo"
            />
          </div>
        )}
        <div>
          <label className="etiqueta-campo">Concepto (opcional)</label>
          <input
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="campo"
            placeholder="Sesión 1 de 4 / anticipo / curso completo…"
          />
        </div>
      </div>
    </Modal>
  );
}

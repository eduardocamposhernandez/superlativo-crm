"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/boton";
import { useToast } from "@/components/ui/toast";
import { Save } from "lucide-react";

interface ConfigInicial {
  nombreNegocio: string;
  colorMarca: string;
  monedaPrincipal: string;
  zonaHoraria: string;
  horarioInicio: string;
  horarioFin: string;
  duracionCitaMin: number;
  metaMensual: number;
  metaClientesMensual: number;
  metodosPago: string;
  motivosPerdida: string;
  mensajeWhatsApp: string;
  umbralEstancamiento: number;
}

export function FormularioConfiguracion({ inicial }: { inicial: ConfigInicial | null }) {
  const router = useRouter();
  const toast = useToast();
  const def: ConfigInicial = {
    nombreNegocio: "SUPERLATIVO",
    colorMarca: "#3fbf8f",
    monedaPrincipal: "MXN",
    zonaHoraria: "America/Mexico_City",
    horarioInicio: "09:00",
    horarioFin: "18:00",
    duracionCitaMin: 30,
    metaMensual: 30000,
    metaClientesMensual: 5,
    metodosPago: "Transferencia,Tarjeta,Liga de pago (Stripe/Mercado Pago)",
    motivosPerdida: "Precio,Lo voy a pensar,No es buen momento,No calificaba,Otro",
    mensajeWhatsApp:
      "Hola, [Nombre]. Soy Eduardo Campos, de Superlativo. Gracias por escribirme. Cuéntame brevemente qué situación te gustaría trabajar.",
    umbralEstancamiento: 7,
  };
  const [c, setC] = useState<ConfigInicial>(inicial ?? def);
  const [cargando, setCargando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const r = await fetch("/api/configuracion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    setCargando(false);
    const j = await r.json();
    if (j.ok) {
      toast.exito("Configuración guardada ✓");
      router.refresh();
    } else toast.error(j.mensaje);
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta-campo">Nombre del negocio</label>
          <input value={c.nombreNegocio} onChange={(e) => setC({ ...c, nombreNegocio: e.target.value })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Color de marca</label>
          <input type="color" value={c.colorMarca} onChange={(e) => setC({ ...c, colorMarca: e.target.value })} className="campo h-12" />
          <p className="ayuda-campo">Toma efecto al recargar.</p>
        </div>
        <div>
          <label className="etiqueta-campo">Moneda</label>
          <select value={c.monedaPrincipal} onChange={(e) => setC({ ...c, monedaPrincipal: e.target.value })} className="campo">
            <option value="MXN">MXN — Peso mexicano</option>
            <option value="USD">USD — Dólar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="COP">COP — Peso colombiano</option>
            <option value="ARS">ARS — Peso argentino</option>
          </select>
        </div>
        <div>
          <label className="etiqueta-campo">Zona horaria</label>
          <input value={c.zonaHoraria} onChange={(e) => setC({ ...c, zonaHoraria: e.target.value })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Horario inicio</label>
          <input type="time" value={c.horarioInicio} onChange={(e) => setC({ ...c, horarioInicio: e.target.value })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Horario fin</label>
          <input type="time" value={c.horarioFin} onChange={(e) => setC({ ...c, horarioFin: e.target.value })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Duración de cita (min)</label>
          <input type="number" value={c.duracionCitaMin} onChange={(e) => setC({ ...c, duracionCitaMin: Number(e.target.value) })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Umbral de "estancado" (días)</label>
          <input type="number" value={c.umbralEstancamiento} onChange={(e) => setC({ ...c, umbralEstancamiento: Number(e.target.value) })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Meta mensual ($)</label>
          <input type="number" value={c.metaMensual} onChange={(e) => setC({ ...c, metaMensual: Number(e.target.value) })} className="campo" />
        </div>
        <div>
          <label className="etiqueta-campo">Meta de clientes/mes</label>
          <input type="number" value={c.metaClientesMensual} onChange={(e) => setC({ ...c, metaClientesMensual: Number(e.target.value) })} className="campo" />
        </div>
      </div>
      <div>
        <label className="etiqueta-campo">Métodos de pago (separados por comas)</label>
        <input value={c.metodosPago} onChange={(e) => setC({ ...c, metodosPago: e.target.value })} className="campo" />
      </div>
      <div>
        <label className="etiqueta-campo">Motivos de pérdida</label>
        <input value={c.motivosPerdida} onChange={(e) => setC({ ...c, motivosPerdida: e.target.value })} className="campo" />
      </div>
      <div>
        <label className="etiqueta-campo">Mensaje tipo de WhatsApp (usa [Nombre] para sustituir)</label>
        <textarea value={c.mensajeWhatsApp} onChange={(e) => setC({ ...c, mensajeWhatsApp: e.target.value })} className="campo min-h-[120px]" />
      </div>
      <div className="flex justify-end">
        <Boton type="submit" cargando={cargando} iconoIzq={<Save className="h-4 w-4" />}>
          Guardar configuración
        </Boton>
      </div>
    </form>
  );
}

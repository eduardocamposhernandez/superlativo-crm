"use client";

import { useState } from "react";
import { Copy, Check, Download, Share2, MessageCircle, Facebook, Instagram, Link as LinkIco } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { useToast } from "@/components/ui/toast";

const CANALES = [
  { id: "instagram", etiqueta: "Instagram", Icono: Instagram, color: "#e1306c" },
  { id: "facebook", etiqueta: "Facebook", Icono: Facebook, color: "#1877f2" },
  { id: "whatsapp", etiqueta: "WhatsApp", Icono: MessageCircle, color: "#25d366" },
  { id: "volante", etiqueta: "Volante / QR", Icono: LinkIco, color: "#666" },
];

export function PanelComparte({ ligaLanding, ligaPropia }: { ligaLanding: string; ligaPropia: string | null }) {
  const [copiada, setCopiada] = useState<string | null>(null);
  const toast = useToast();

  function ligaConCanal(base: string, canal: string) {
    return `${base}?utm_source=${canal}&utm_medium=share`;
  }

  async function copiar(texto: string, id: string) {
    await navigator.clipboard.writeText(texto);
    setCopiada(id);
    toast.exito("Copiada ✓");
    setTimeout(() => setCopiada(null), 1500);
  }

  function compartirNativo(url: string) {
    if (navigator.share) navigator.share({ url, title: "SUPERLATIVO" }).catch(() => null);
    else copiar(url, "share");
  }

  function descargarQR(url: string, nombre: string) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${nombre}.png`;
    a.target = "_blank";
    a.click();
  }

  function Bloque({ titulo, base }: { titulo: string; base: string }) {
    return (
      <div className="tarjeta p-5">
        <h3 className="mb-3 text-base font-semibold text-texto">{titulo}</h3>
        <div className="flex items-center gap-2 rounded-xl border border-borde bg-superficie p-2 text-sm">
          <span className="flex-1 truncate text-texto-suave">{base}</span>
          <Boton tamano="sm" variante="suave" onClick={() => copiar(base, `${titulo}-base`)}>
            {copiada === `${titulo}-base` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copiar
          </Boton>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Boton variante="secundario" tamano="sm" onClick={() => compartirNativo(base)} iconoIzq={<Share2 className="h-4 w-4" />}>
            Compartir
          </Boton>
          <Boton variante="secundario" tamano="sm" onClick={() => descargarQR(base, titulo.replace(/\s+/g, "-"))} iconoIzq={<Download className="h-4 w-4" />}>
            Descargar QR
          </Boton>
        </div>
        <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-texto-tenue">
          Liga marcada por canal (úsala según dónde la pegues)
        </p>
        <div className="space-y-2">
          {CANALES.map(({ id, etiqueta, Icono, color }) => {
            const l = ligaConCanal(base, id);
            return (
              <div key={id} className="flex flex-wrap items-center gap-2 rounded-xl border border-borde p-2 text-sm">
                <Icono className="h-4 w-4 flex-shrink-0" style={{ color }} aria-hidden />
                <span className="font-medium text-texto">{etiqueta}</span>
                <code className="ml-1 flex-1 truncate text-xs text-texto-suave">{l}</code>
                <Boton tamano="sm" variante="fantasma" onClick={() => copiar(l, `${titulo}-${id}`)}>
                  {copiada === `${titulo}-${id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Boton>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Bloque titulo="Landing principal" base={ligaLanding} />
      {ligaPropia ? (
        <Bloque titulo="Tu liga de agenda" base={ligaPropia} />
      ) : (
        <div className="tarjeta p-5 text-sm text-texto-suave">
          <p>
            Para tener tu propia liga de agenda (estilo Calendly), pídele al admin que te asigne un{" "}
            <code>slug</code> en tu perfil (ej. <code>maria</code>). Tu liga quedará en
            {" "}
            <code>{ligaLanding}/agenda/[slug]</code>.
          </p>
        </div>
      )}
    </div>
  );
}

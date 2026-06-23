"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Boton } from "@/components/ui/boton";
import { ChevronLeft, ChevronRight, X, Keyboard, BookOpen, HelpCircle } from "lucide-react";

interface Paso {
  titulo: string;
  texto: string;
  selector?: string; // CSS selector del elemento a resaltar (opcional)
}

function pasosPorRol(rol: string): Paso[] {
  const comunes: Paso[] = [
    {
      titulo: "Bienvenido a SUPERLATIVO 👋",
      texto:
        "Te voy a guiar en 60 segundos por lo más importante. Cada mañana abre tu CRM, en serio: ahí está el dinero.",
    },
    {
      titulo: "Este es tu menú",
      texto:
        "Tablero, Clientes, Embudo, Agenda, Pagos… Aquí vive todo. En el celular, las 4 más usadas están abajo a la mano.",
      selector: "aside",
    },
    {
      titulo: "Hoy te toca",
      texto:
        "Esta es la pestaña más importante. Cada mañana ábrela y contacta primero a los 🔥 calientes. El primero que llama, gana.",
    },
    {
      titulo: "Buscador instantáneo",
      texto:
        "Toca la barra de arriba (o presiona '/') y encuentras cualquier cliente, teléfono o nota al instante.",
    },
    {
      titulo: "+ Nuevo",
      texto:
        "Con este botón agregas un cliente nuevo en segundos. Pon nombre y WhatsApp y ya está.",
    },
    {
      titulo: "El expediente del cliente",
      texto:
        "Haz clic en el nombre del cliente desde DONDE SEA — embudo, lista, buscador — y se abre su historia completa: contactos, pagos, archivos, próxima acción.",
    },
    {
      titulo: "Tema y Ayuda",
      texto:
        "Arriba a la derecha cambias el tema (claro/oscuro/automático). Y el botón Ayuda relanza este tutorial cuando quieras.",
    },
  ];

  if (rol === "ADMIN") {
    return [
      ...comunes,
      {
        titulo: "Panel admin (solo tú)",
        texto:
          "En 'Panel admin' das de alta vendedores, ves la actividad del equipo y haces respaldos.",
      },
      {
        titulo: "Comparte y crece",
        texto:
          "Tu landing y tu liga ya están listas. Compártelas hoy con un solo clic o por QR. Cada lead cae al embudo solo.",
      },
    ];
  }
  return [
    ...comunes,
    {
      titulo: "Tu meta",
      texto:
        "En el Tablero ves tu meta del mes y a cuánto vas. Mantenla pegada al corazón.",
    },
  ];
}

interface PropsTour {
  visible: boolean;
  alCerrar: () => void;
  rol: string;
}

export function Tour({ visible, alCerrar, rol }: PropsTour) {
  const pasos = pasosPorRol(rol);
  const [i, setI] = useState(0);

  const saltar = useCallback(async () => {
    await fetch("/api/perfil/onboarding", { method: "POST" }).catch(() => null);
    alCerrar();
  }, [alCerrar]);

  if (!visible || typeof window === "undefined") return null;
  const paso = pasos[i];

  return createPortal(
    <div
      role="dialog"
      aria-label="Tutorial guiado"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center"
    >
      <div className="relative w-full max-w-md tarjeta animate-aparecer m-4 p-6">
        <button
          onClick={saltar}
          aria-label="Cerrar tutorial"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-texto-suave hover:bg-superficie"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-marca-600">
          <span className="rounded-full bg-marca-50 px-2 py-0.5 dark:bg-marca-500/10">
            Paso {i + 1} de {pasos.length}
          </span>
        </div>

        <h3 className="text-xl font-bold text-texto">{paso.titulo}</h3>
        <p className="mt-2 text-sm text-texto-suave">{paso.texto}</p>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button onClick={saltar} className="text-sm text-texto-suave hover:text-texto">
            Saltar tour
          </button>
          <div className="flex gap-2">
            <Boton
              variante="secundario"
              tamano="sm"
              disabled={i === 0}
              onClick={() => setI((n) => Math.max(0, n - 1))}
              iconoIzq={<ChevronLeft className="h-4 w-4" />}
            >
              Atrás
            </Boton>
            {i < pasos.length - 1 ? (
              <Boton tamano="sm" onClick={() => setI((n) => n + 1)} iconoDer={<ChevronRight className="h-4 w-4" />}>
                Siguiente
              </Boton>
            ) : (
              <Boton tamano="sm" onClick={saltar}>
                ¡A vender!
              </Boton>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface PropsAyuda {
  abierto: boolean;
  alCerrar: () => void;
  rol: string;
}

export function LanzadorTutorial({ abierto, alCerrar, rol }: PropsAyuda) {
  const [verTour, setVerTour] = useState(false);
  const [verAtajos, setVerAtajos] = useState(false);

  useEffect(() => {
    const onAbrir = () => {
      /* Permite abrir desde fuera con CustomEvent */
    };
    window.addEventListener("abrir-ayuda", onAbrir);
    return () => window.removeEventListener("abrir-ayuda", onAbrir);
  }, []);

  if (!abierto) return null;

  return (
    <>
      <div
        role="dialog"
        className="fixed right-4 top-16 z-50 w-72 tarjeta animate-aparecer p-3"
        onMouseLeave={alCerrar}
      >
        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-texto-tenue">
          Ayuda
        </p>
        <button
          onClick={() => {
            setVerTour(true);
            alCerrar();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-texto hover:bg-superficie"
        >
          <BookOpen className="h-4 w-4 text-marca-600" />
          Ver el tutorial de nuevo
        </button>
        <button
          onClick={() => {
            setVerAtajos(true);
            alCerrar();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-texto hover:bg-superficie"
        >
          <Keyboard className="h-4 w-4 text-marca-600" />
          Atajos de teclado
        </button>
        <div className="mt-2 rounded-lg bg-marca-50 p-3 text-xs text-marca-700 dark:bg-marca-500/10 dark:text-marca-300">
          <p className="font-semibold">¿Cómo uso esto cada mañana?</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
            <li>Abre <strong>Hoy te toca</strong>.</li>
            <li>Contacta a los <strong>🔥 calientes</strong> primero.</li>
            <li>Registra qué pasó y deja <strong>la próxima acción</strong>.</li>
          </ol>
        </div>
      </div>

      <Tour visible={verTour} alCerrar={() => setVerTour(false)} rol={rol} />

      {verAtajos && (
        <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setVerAtajos(false)} aria-hidden />
          <div className="relative w-full max-w-md tarjeta p-6">
            <div className="mb-4 flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-marca-600" />
              <h3 className="text-lg font-bold text-texto">Atajos de teclado</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                ["/", "Abrir buscador"],
                ["Ctrl/Cmd + K", "Abrir buscador"],
                ["N", "Nuevo cliente"],
                ["?", "Mostrar esta ayuda"],
                ["Esc", "Cerrar modales"],
              ].map(([k, t]) => (
                <li key={k as string} className="flex items-center justify-between border-b border-borde pb-2">
                  <span className="text-texto">{t}</span>
                  <kbd className="rounded-md border border-borde bg-superficie px-2 py-0.5 text-xs font-mono">
                    {k}
                  </kbd>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setVerAtajos(false)}
              className="boton boton-primario mt-4 w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Lanzador automático del tour cuando el usuario nunca lo ha completado */
export function AutoTour({ rol, pendiente }: { rol: string; pendiente: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (pendiente) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [pendiente]);
  return <Tour visible={visible} alCerrar={() => setVisible(false)} rol={rol} />;
}

/** Botón flotante de ayuda visible cuando se invoca por teclado "?" */
export function AyudaFlotanteIcono() {
  return <HelpCircle className="h-5 w-5" aria-hidden />;
}

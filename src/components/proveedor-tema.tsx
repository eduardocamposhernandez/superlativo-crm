"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Tema = "claro" | "oscuro" | "auto";

interface ContextoTema {
  tema: Tema;
  temaResuelto: "claro" | "oscuro";
  cambiarTema: (t: Tema) => void;
}

const Contexto = createContext<ContextoTema | null>(null);

const CLAVE_LOCAL = "superlativo-tema";

function aplicarTemaDOM(t: Tema) {
  const oscuroSistema = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const oscuro = t === "oscuro" || (t === "auto" && oscuroSistema);
  document.documentElement.classList.add("cambiando-tema");
  document.documentElement.classList.toggle("dark", oscuro);
  // quita la transición después de aplicar para no ralentizar interacciones
  window.setTimeout(() => {
    document.documentElement.classList.remove("cambiando-tema");
  }, 220);
}

export function ProveedorTema({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("auto");
  const [temaResuelto, setTemaResuelto] = useState<"claro" | "oscuro">("claro");

  useEffect(() => {
    const guardado = (localStorage.getItem(CLAVE_LOCAL) as Tema) || "auto";
    setTema(guardado);
    const calcular = () => {
      const oscuroSistema = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTemaResuelto(
        guardado === "oscuro" || (guardado === "auto" && oscuroSistema)
          ? "oscuro"
          : "claro",
      );
    };
    calcular();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (tema === "auto") {
        aplicarTemaDOM("auto");
        calcular();
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarTema = useCallback((nuevo: Tema) => {
    setTema(nuevo);
    localStorage.setItem(CLAVE_LOCAL, nuevo);
    aplicarTemaDOM(nuevo);
    const oscuroSistema = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTemaResuelto(
      nuevo === "oscuro" || (nuevo === "auto" && oscuroSistema) ? "oscuro" : "claro",
    );
    // Guardar también en el servidor (perfil del usuario) si está autenticado
    fetch("/api/perfil/tema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: nuevo }),
    }).catch(() => {
      /* sin sesión o sin red — el local ya quedó guardado */
    });
  }, []);

  return (
    <Contexto.Provider value={{ tema, temaResuelto, cambiarTema }}>
      {children}
    </Contexto.Provider>
  );
}

export function useTema() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useTema debe usarse dentro de ProveedorTema");
  return c;
}

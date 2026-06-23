"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { Modal } from "./modal";
import { Boton } from "./boton";
import { AlertTriangle } from "lucide-react";

interface Opciones {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligro?: boolean;
}

interface Contexto {
  confirmar: (op: Opciones) => Promise<boolean>;
}

const Ctx = createContext<Contexto | null>(null);

export function ProveedorConfirmar({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<
    (Opciones & { resolver: (v: boolean) => void }) | null
  >(null);

  const confirmar = useCallback(
    (op: Opciones) =>
      new Promise<boolean>((resolver) => {
        setEstado({ ...op, resolver });
      }),
    [],
  );

  const cerrar = (resultado: boolean) => {
    estado?.resolver(resultado);
    setEstado(null);
  };

  return (
    <Ctx.Provider value={{ confirmar }}>
      {children}
      <Modal
        abierto={!!estado}
        alCerrar={() => cerrar(false)}
        titulo={estado?.titulo ?? ""}
        anchoMax="sm"
        pieDePagina={
          <>
            <Boton variante="secundario" onClick={() => cerrar(false)}>
              {estado?.textoCancelar ?? "Cancelar"}
            </Boton>
            <Boton
              variante={estado?.peligro ? "peligro" : "primario"}
              onClick={() => cerrar(true)}
            >
              {estado?.textoConfirmar ?? "Confirmar"}
            </Boton>
          </>
        }
      >
        <div className="flex gap-3">
          {estado?.peligro && (
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-peligro" aria-hidden />
          )}
          <p className="text-sm text-texto">{estado?.mensaje}</p>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

export function useConfirmar() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConfirmar debe usarse dentro de ProveedorConfirmar");
  return c.confirmar;
}
